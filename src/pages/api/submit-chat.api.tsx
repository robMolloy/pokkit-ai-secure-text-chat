import { PocketBase } from "@/config/pocketbaseConfig";
import { delay, safeJsonParse } from "@/lib/utils";
import {
  createAiTextMessageRecord,
  getAiTextMessageRecordByThreadId,
} from "@/modules/aiTextMessages/dbAiTextMessageUtils";
import {
  createAiThreadRecord,
  getAiThreadRecordByFriendlyThreadId,
  updateAiThreadRecordTitle,
} from "@/modules/aiThreads/dbAiThreadRecordUtils";
import {
  callAnthropic,
  createAnthropicTextMessage,
  createTitleForMessageThreadWithAnthropic,
} from "@/modules/providers/anthropicApi";
import { userSchema } from "@/modules/users/dbUsersUtils";
import Anthropic from "@anthropic-ai/sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const authenticatePbUserToken = async (
  p: { pb: PocketBase; token: string } | { pbUrl: string; token: string },
) => {
  try {
    const newPbInstance = new PocketBase("pb" in p ? p.pb.baseURL : p.pbUrl);
    newPbInstance.authStore.save(p.token, null);

    if (!newPbInstance.authStore.isValid)
      return { success: false, error: "Invalid token" } as const;

    await newPbInstance.collection("users").authRefresh();

    const record = newPbInstance.authStore.record;

    const parsedRecord = userSchema.safeParse(record);
    if (!parsedRecord.success) return { success: false, error: "invalid user record" } as const;

    return { success: true, data: { pb: newPbInstance, user: parsedRecord.data } } as const;
  } catch (e) {
    const error = e as { message: string };
    return { success: false, error: error.message } as const;
  }
};

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY });

const schema = z.object({ token: z.string(), prompt: z.string(), threadFriendlyId: z.string() });

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const timeoutInMs = 30_000;

const flush = (
  p: { res: NextApiResponse<unknown> } & ({ error: string } | { message: string }),
) => {
  const { res, ...rest } = p;
  res.write(JSON.stringify(rest));
  res?.flushHeaders();
  if ("flush" in res && typeof res.flush === "function") res.flush();
};

const handler = async (req: NextApiRequest, res: NextApiResponse<unknown>) => {
  const timeoutPromise = delay(timeoutInMs).then(
    () => ({ success: false, error: "request timeout" }) as const,
  );

  const jsonParsedBody = safeJsonParse(req.body);
  if (!jsonParsedBody.success) return res.status(400).json({ error: "Invalid request body" });

  const parsedBody = schema.safeParse(jsonParsedBody.data);
  if (!parsedBody.success) return res.status(400).json({ error: "Invalid request body" });

  if (!pbUrl) return res.status(500).json({ error: "PocketBase URL is not set" });
  const authResult = await authenticatePbUserToken({ pbUrl, token: parsedBody.data.token });

  if (!authResult.success) return res.status(401).json({ error: authResult.error });

  if (authResult.data.user.status !== "approved" && authResult.data.user.status !== "admin")
    return res.status(401).json({ error: "User must be approved or admin" });

  const thread = await (async () => {
    const initThreadResponse = await getAiThreadRecordByFriendlyThreadId({
      pb: authResult.data.pb,
      friendlyThreadId: parsedBody.data.threadFriendlyId,
    });
    if (initThreadResponse.success) return initThreadResponse.data;

    const resp = await createAiThreadRecord({
      pb: authResult.data.pb,
      data: { friendlyId: parsedBody.data.threadFriendlyId, title: "" },
    });
    if (resp.success) return resp.data;
  })();

  if (!thread) return res.status(500).json({ error: "Failed to create or retrieve thread" });

  const createUserAiTextMessageRecordResp = await createAiTextMessageRecord({
    pb: authResult.data.pb,
    data: { threadId: thread.id, role: "user", contentText: parsedBody.data.prompt },
  });

  if (!createUserAiTextMessageRecordResp.success)
    return res.status(500).json({ error: "Failed to create ai text message" });

  const messagesResp = await getAiTextMessageRecordByThreadId({
    pb: authResult.data.pb,
    threadId: thread.id,
  });

  if (!messagesResp.success)
    return res.status(500).json({ error: "Failed to fetch ai text message records" });

  const anthropicMessages = messagesResp.data.map((x) =>
    createAnthropicTextMessage({
      role: x.role,
      text: x.contentText,
    }),
  );

  if (anthropicMessages.length > 2 && !thread.title) {
    createTitleForMessageThreadWithAnthropic({
      anthropic,
      messages: anthropicMessages,
    }).then((titleResp) => {
      if (titleResp.success)
        updateAiThreadRecordTitle({ pb: authResult.data.pb, id: thread.id, title: titleResp.data });
    });
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let timeSinceLastFlush = 0;
  let messageChunksSinceLastFlush: string[] = [];

  const callAnthropicPromise = callAnthropic({
    anthropicInstance: anthropic,
    messages: [
      ...anthropicMessages,
      createAnthropicTextMessage({ role: "user", text: parsedBody.data.prompt }),
    ],
    onNewChunk: (message) => {
      messageChunksSinceLastFlush.push(message);

      const now = Date.now();
      if (now - timeSinceLastFlush < 40) return;
      timeSinceLastFlush = now;

      flush({ res, message: messageChunksSinceLastFlush.join("") });
      messageChunksSinceLastFlush = [];
    },
  });

  const promiseResult = await Promise.race([callAnthropicPromise, timeoutPromise]);
  if (!promiseResult.success) return flush({ res, error: "request timeout" });

  flush({ res, message: messageChunksSinceLastFlush.join("") });

  const createAssistantAiTextMessageRecordResp = await createAiTextMessageRecord({
    pb: authResult.data.pb,
    data: { threadId: thread.id, role: "assistant", contentText: promiseResult.data },
  });

  if (!createAssistantAiTextMessageRecordResp.success)
    flush({ res, error: "Failed to create assistant ai text message" });

  res.end();
};

export default handler;

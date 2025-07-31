import { PocketBase } from "@/config/pocketbaseConfig";
import { delay, safeJsonParse } from "@/lib/utils";
import { createAiTextMessageRecord } from "@/modules/aiTextMessages/dbAiTextMessageUtils";
import {
  createAiThreadRecord,
  getAiThreadRecordByFriendlyThreadId,
} from "@/modules/aiThreads/dbAiThreadRecordUtils";
import { callAnthropic, createAnthropicTextMessage } from "@/modules/providers/anthropicApi";
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
  console.log(`submit-chat.api.tsx:${/*LL*/ 58}`, {});

  const jsonParsedBody = safeJsonParse(req.body);
  if (!jsonParsedBody.success) return res.status(400).json({ error: "Invalid request body" });
  console.log(`submit-chat.api.tsx:${/*LL*/ 62}`, {});

  const parsedBody = schema.safeParse(jsonParsedBody.data);
  if (!parsedBody.success) return res.status(400).json({ error: "Invalid request body" });
  console.log(`submit-chat.api.tsx:${/*LL*/ 66}`, {});

  if (!pbUrl) return res.status(500).json({ error: "PocketBase URL is not set" });
  console.log(`submit-chat.api.tsx:${/*LL*/ 69}`, {});
  const authResult = await authenticatePbUserToken({ pbUrl, token: parsedBody.data.token });

  if (!authResult.success) return res.status(401).json({ error: authResult.error });
  console.log(`submit-chat.api.tsx:${/*LL*/ 73}`, {});

  if (authResult.data.user.status !== "approved" && authResult.data.user.status !== "admin")
    return res.status(401).json({ error: "User must be approved or admin" });
  console.log(`submit-chat.api.tsx:${/*LL*/ 77}`, {});

  const thread = await (async () => {
    const initThreadResponse = await getAiThreadRecordByFriendlyThreadId({
      pb: authResult.data.pb,
      friendlyThreadId: parsedBody.data.threadFriendlyId,
    });
    console.log(`submit-chat.api.tsx:${/*LL*/ 84}`, {});
    if (initThreadResponse.success) return initThreadResponse.data;
    console.log(`submit-chat.api.tsx:${/*LL*/ 86}`, {});

    const resp = await createAiThreadRecord({
      pb: authResult.data.pb,
      data: { friendlyId: parsedBody.data.threadFriendlyId, title: "" },
    });
    console.log(`submit-chat.api.tsx:${/*LL*/ 92}`, {});
    if (resp.success) return resp.data;
  })();

  console.log(`submit-chat.api.tsx:${/*LL*/ 96}`, {});
  if (!thread) return res.status(500).json({ error: "Failed to create or retrieve thread" });

  console.log(`submit-chat.api.tsx:${/*LL*/ 99}`, {});
  const createUserAiTextMessageRecordResp = await createAiTextMessageRecord({
    pb: authResult.data.pb,
    data: { threadId: thread.id, role: "user", contentText: parsedBody.data.prompt },
  });

  console.log(`submit-chat.api.tsx:${/*LL*/ 105}`, {});
  if (!createUserAiTextMessageRecordResp.success)
    return res.status(500).json({ error: "Failed to create ai text message" });
  console.log(`submit-chat.api.tsx:${/*LL*/ 108}`, {});

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let timeSinceLastFlush = 0;
  let messageChunksSinceLastFlush: string[] = [];

  const callAnthropicPromise = callAnthropic({
    anthropicInstance: anthropic,
    messages: [createAnthropicTextMessage({ role: "user", text: parsedBody.data.prompt })],
    onNewChunk: (message) => {
      console.log(`submit-chat.api.tsx:${/*LL*/ 121}`, {});
      messageChunksSinceLastFlush.push(message);

      const now = Date.now();
      if (now - timeSinceLastFlush < 40) return;
      timeSinceLastFlush = now;

      flush({ res, message: messageChunksSinceLastFlush.join("") });
      messageChunksSinceLastFlush = [];
    },
  });
  console.log(`submit-chat.api.tsx:${/*LL*/ 132}`, {});

  const promiseResult = await Promise.race([callAnthropicPromise, timeoutPromise]);
  if (!promiseResult.success) return flush({ res, error: "request timeout" });

  console.log(`submit-chat.api.tsx:${/*LL*/ 136}`, messageChunksSinceLastFlush.join(""));

  flush({ res, message: messageChunksSinceLastFlush.join("") });

  console.log(`submit-chat.api.tsx:${/*LL*/ 140}`, {});
  const createAssistantAiTextMessageRecordResp = await createAiTextMessageRecord({
    pb: authResult.data.pb,
    data: { threadId: thread.id, role: "assistant", contentText: promiseResult.data },
  });
  console.log(`submit-chat.api.tsx:${/*LL*/ 145}`, createAssistantAiTextMessageRecordResp.success);

  if (!createAssistantAiTextMessageRecordResp.success)
    flush({ res, error: "Failed to create assistant ai text message" });

  console.log(`submit-chat.api.tsx:${/*LL*/ 150}`, {});

  res.end();
};

export default handler;

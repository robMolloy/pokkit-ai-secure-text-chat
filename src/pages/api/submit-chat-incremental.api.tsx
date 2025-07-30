import { PocketBase } from "@/config/pocketbaseConfig";
import { delay, safeJsonParse } from "@/lib/utils";
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

    return { success: true, data: parsedRecord.data } as const;
  } catch (e) {
    const error = e as { message: string };
    return { success: false, error: error.message } as const;
  }
};

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY });

const schema = z.object({
  token: z.string(),
  prompt: z.string(),
});

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
  const timeoutPromise = delay(timeoutInMs);

  const parsedBody = safeJsonParse(req.body);
  if (!parsedBody.success) return res.status(400).json({ error: "Invalid request body" });

  const parsed = schema.safeParse(parsedBody.data);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

  if (!pbUrl) return res.status(500).json({ error: "PocketBase URL is not set" });

  const authResult = await authenticatePbUserToken({ pbUrl, token: parsed.data.token });

  if (!authResult.success) return res.status(401).json({ error: authResult.error });

  if (authResult.data.status !== "approved" && authResult.data.status !== "admin")
    return res.status(401).json({ error: "User must be approved or admin" });

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let timeSinceLastFlush = 0;
  let messageChunksSinceLastFlush: string[] = [];

  const callAnthropicPromise = callAnthropic({
    anthropicInstance: anthropic,
    messages: [createAnthropicTextMessage({ role: "user", text: parsed.data.prompt })],
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
  if (!promiseResult?.success) flush({ res, error: "request timeout" });

  flush({ res, message: messageChunksSinceLastFlush.join("") });

  res.end();
};

export default handler;

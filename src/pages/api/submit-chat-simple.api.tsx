import { delay } from "@/lib/utils";
import { callAnthropic, createAnthropicTextMessage } from "@/modules/providers/anthropicApi";
import Anthropic from "@anthropic-ai/sdk";
import type { NextApiRequest, NextApiResponse } from "next";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY });
const timeoutInMs = 30_000;

const handler = async (_req: NextApiRequest, res: NextApiResponse<unknown>) => {
  const delayPromise = delay(timeoutInMs);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let timeSinceLastFlush = 0;
  let messageChunksSinceLastFlush: string[] = [];

  const callAnthropicPromise = callAnthropic({
    anthropicInstance: anthropic,
    messages: [
      createAnthropicTextMessage({
        role: "user",
        text: "explain react useEffect",
      }),
    ],
    onNewChunk: (message) => {
      const now = Date.now();
      messageChunksSinceLastFlush.push(message);

      if (now - timeSinceLastFlush < 40) return;

      timeSinceLastFlush = now;
      res.write(JSON.stringify({ message: messageChunksSinceLastFlush.join("") }));
      messageChunksSinceLastFlush = [];
      res?.flushHeaders();
      if ("flush" in res && typeof res.flush === "function") res.flush();
    },
  });

  const promiseResult = await Promise.race([callAnthropicPromise, delayPromise]);
  if (!promiseResult?.success) res.write(JSON.stringify({ error: "request timeout" }));

  res.end();
};

export default handler;

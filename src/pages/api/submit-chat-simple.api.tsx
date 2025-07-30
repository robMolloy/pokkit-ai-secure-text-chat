import { callAnthropic, createAnthropicMessage } from "@/modules/providers/anthropicApi";
import Anthropic from "@anthropic-ai/sdk";
import type { NextApiRequest, NextApiResponse } from "next";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY });

const handler = async (_req: NextApiRequest, res: NextApiResponse<unknown>) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let timeSinceLastFlush = 0;
  let messageChunksSinceLastFlush: string[] = [];

  const callAnthropicResponse = await callAnthropic({
    anthropicInstance: anthropic,
    messages: [
      createAnthropicMessage({
        role: "user",
        content: [{ type: "text", text: "explain react useEffect" }],
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
  console.log(`submit-chat-simple.api.tsx:${/*LL*/ 57}`, callAnthropicResponse);

  return res.end();
};

export default handler;

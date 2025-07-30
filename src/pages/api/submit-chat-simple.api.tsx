import { createAnthropicMessage, TAnthropicMessage } from "@/modules/providers/anthropicApi";
import Anthropic from "@anthropic-ai/sdk";
import type { NextApiRequest, NextApiResponse } from "next";

const delay = async (x: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), x);
  });
};

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY });

const callAnthropic = async (p: {
  anthropicInstance: Anthropic;
  messages: TAnthropicMessage[];
  onNewChunk: (x: string) => void;
}) => {
  try {
    const responseChunks: string[] = [];
    const chunks = await p.anthropicInstance.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 5000,
      messages: p.messages,
      stream: true,
    });

    for await (const chunk of chunks) {
      if (chunk.type === "content_block_delta" && "text" in chunk.delta) {
        await delay(25);
        responseChunks.push(chunk.delta.text);
        p.onNewChunk(chunk.delta.text);
      }
    }

    return { success: true, data: responseChunks.join("") } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};

const handler = async (_req: NextApiRequest, res: NextApiResponse<unknown>) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const callAnthropicResponse = await callAnthropic({
    anthropicInstance: anthropic,
    messages: [
      createAnthropicMessage({
        role: "user",
        content: [{ type: "text", text: "explain react useEffect" }],
      }),
    ],
    onNewChunk: (message) => {
      res.write(JSON.stringify({ message }));
      res?.flushHeaders();
      if ("flush" in res && typeof res.flush === "function") res.flush();
    },
  });
  console.log(`submit-chat-simple.api.tsx:${/*LL*/ 57}`, callAnthropicResponse);

  return res.end();
};

export default handler;

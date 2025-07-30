import { delay, uuid } from "@/lib/utils";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const anthropicMessageContentTextSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

export type TAnthropicMessageContentItem = z.infer<typeof anthropicMessageContentTextSchema>;
export type TAnthropicMessageRole = "user" | "assistant";
export type TAnthropicMessage = {
  id: string;
  role: TAnthropicMessageRole;
  content: TAnthropicMessageContentItem[];
};

export const createAnthropicMessage = (p: {
  role: TAnthropicMessageRole;
  content: TAnthropicMessageContentItem[];
}): TAnthropicMessage => {
  return { id: uuid(), role: p.role, content: p.content };
};

export const createAnthropicTextMessage = (p: {
  role: TAnthropicMessageRole;
  text: string;
}): TAnthropicMessage => {
  return createAnthropicMessage({ role: p.role, content: [{ type: "text", text: p.text }] });
};

export type TStreamStatus = "streaming" | "finished" | "error";
export const callAnthropic = async (p: {
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

export const testAnthropicInstance = async (p: { anthropic: Anthropic }) => {
  const rtn = await callAnthropic({
    anthropicInstance: p.anthropic,
    messages: [
      createAnthropicMessage({ role: "user", content: [{ type: "text", text: "Hello, world!" }] }),
    ],
    onNewChunk: () => {},
  });

  return rtn;
};

export const createTitleForMessageThreadWithAnthropic = async (p: {
  anthropic: Anthropic;
  messages: TAnthropicMessage[];
}) => {
  const text =
    "create a succinct title in plain text for the previous messages in this conversation";

  const rtn = await callAnthropic({
    anthropicInstance: p.anthropic,
    messages: [
      ...p.messages,
      createAnthropicMessage({ role: "user", content: [{ type: "text", text }] }),
    ],
    onNewChunk: () => {},
  });

  return rtn;
};

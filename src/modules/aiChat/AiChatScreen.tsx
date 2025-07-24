import { MainLayout } from "@/components/layout/Layout";
import { pb } from "@/config/pocketbaseConfig";
import {
  AssistantTextMessage,
  ErrorMessage,
  UserTextMessage,
} from "@/modules/aiChat/components/Messages";
import { ScrollContainer } from "@/modules/aiChat/components/ScrollContainer";
import { useAiThreadRecordsStore } from "@/modules/aiThreads/aiThreadRecordsStore";
import { useAnthropicStore } from "@/modules/providers/anthropicStore";
import { ErrorScreen } from "@/screens/ErrorScreen";
import { LoadingScreen } from "@/screens/LoadingScreen";
import React, { useState } from "react";
import { useAiTextMessageRecordsStore } from "../aiTextMessages/aiTextMessageRecordsStore";
import {
  createAiTextMessageRecord,
  TAiTextMessageRecord,
} from "../aiTextMessages/dbAiTextMessageUtils";
import {
  createAiThreadRecord,
  TAiThreadRecord,
  updateAiThreadRecordTitle,
} from "../aiThreads/dbAiThreadRecordUtils";
import {
  callAnthropic,
  createAnthropicTextMessage,
  createTitleForMessageThreadWithAnthropic,
  TStreamStatus,
} from "../providers/anthropicApi";
import { AiInputTextForm } from "./components/AiInputTextForm";
import Anthropic from "@anthropic-ai/sdk";

const handleSubmitMessage = async (p: {
  anthropicInstance: Anthropic;
  text: string;
  thread: TAiThreadRecord;
  historicalAiTextMessageRecords: TAiTextMessageRecord[];
  onStreamStatusChange: (status: TStreamStatus) => void;
  onStreamChange: (text: string) => void;
}) => {
  const createAiTextMessageRecordResp = await createAiTextMessageRecord({
    pb,
    data: { threadId: p.thread.id, role: "user", contentText: p.text },
  });

  if (!createAiTextMessageRecordResp.success)
    return { success: false, error: "create ai text message failed" } as const;

  const anthropicMessages = [
    ...p.historicalAiTextMessageRecords.map((x) =>
      createAnthropicTextMessage({ role: x.role, text: x.contentText }),
    ),
    createAnthropicTextMessage({ role: "user", text: p.text }),
  ];

  if (anthropicMessages.length > 2 && !p.thread.title) {
    createTitleForMessageThreadWithAnthropic({
      anthropic: p.anthropicInstance,
      messages: anthropicMessages,
    }).then((resp) => {
      if (resp.success) updateAiThreadRecordTitle({ pb, id: p.thread.id, title: resp.data });
    });
  }

  const anthropicResp = await callAnthropic({
    anthropic: p.anthropicInstance,
    messages: anthropicMessages,
    onStreamStatusChange: p.onStreamStatusChange,
    onStreamChange: p.onStreamChange,
  });

  if (!anthropicResp.success) return { success: false, error: "anthropic call failed" } as const;

  const createAssistantAiTextMessageRecordResp = await createAiTextMessageRecord({
    pb,
    data: { threadId: p.thread.id, role: "assistant", contentText: anthropicResp.data },
  });

  if (!createAssistantAiTextMessageRecordResp.success)
    return { success: false, error: "create assistant ai text message failed" } as const;

  return { success: true } as const;
};

export const AiChatScreen = (p: { threadFriendlyId: string }) => {
  const threadFriendlyId = p.threadFriendlyId;

  const aiThreadRecordsStore = useAiThreadRecordsStore();
  const currentThread = aiThreadRecordsStore.data?.find((x) => x.friendlyId === threadFriendlyId);

  const aiTextMessagesRecordsStore = useAiTextMessageRecordsStore();
  const aiTextMessageRecords = currentThread?.id
    ? aiTextMessagesRecordsStore.getMessagesByThreadId(currentThread.id)
    : undefined;

  const aiTextRecords = (aiTextMessageRecords ?? []).sort((a, b) =>
    a.created < b.created ? -1 : 1,
  );

  const anthropicStore = useAnthropicStore();
  const anthropicInstance = anthropicStore.data;
  const [mode, setMode] = useState<"ready" | "thinking" | "streaming" | "error">("ready");
  const [streamedText, setStreamedText] = useState("");

  if (aiThreadRecordsStore.data === undefined) return <LoadingScreen />;
  if (aiThreadRecordsStore.data === null) return <ErrorScreen />;

  return (
    <MainLayout fillPageExactly padding={false}>
      <div className="flex h-full flex-col">
        <ScrollContainer scrollToBottomDeps={[threadFriendlyId]}>
          <div className="p-4 pb-0">
            {aiTextRecords.length === 0 && (
              <AssistantTextMessage>Hello! How can I help you today?</AssistantTextMessage>
            )}
            {aiTextRecords.map((x) => {
              if (x.role === "assistant")
                return <AssistantTextMessage key={x.id}>{x.contentText}</AssistantTextMessage>;

              return <UserTextMessage key={x.id}>{x.contentText}</UserTextMessage>;
            })}

            {mode === "thinking" && <p>Thinking...</p>}
            {mode === "streaming" && <AssistantTextMessage>{streamedText}</AssistantTextMessage>}
            {mode === "error" && <ErrorMessage />}
          </div>
        </ScrollContainer>

        <div className="p-4 pt-1">
          {anthropicInstance ? (
            <AiInputTextForm
              disabled={mode === "thinking" || mode === "streaming"}
              onSubmit={async (x) => {
                fetch("/api/submit-chat", {
                  method: "POST",
                  body: JSON.stringify({ token: pb.authStore.token }),
                });
                setMode("thinking");
                const thread = await (async () => {
                  if (currentThread) return currentThread;

                  const resp = await createAiThreadRecord({
                    pb,
                    data: { friendlyId: threadFriendlyId, title: "" },
                  });
                  if (resp.success) return resp.data;
                })();

                if (!thread) {
                  console.error("thread not found");
                  return setMode("error");
                }

                const resp = await handleSubmitMessage({
                  anthropicInstance,
                  text: x.text,
                  thread,
                  historicalAiTextMessageRecords: aiTextRecords,
                  onStreamStatusChange: (status) =>
                    setMode(status === "finished" ? "ready" : status),
                  onStreamChange: (text) => setStreamedText(text),
                });

                setMode(resp.success ? "ready" : "error");
              }}
            />
          ) : (
            <div>No AI instance</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

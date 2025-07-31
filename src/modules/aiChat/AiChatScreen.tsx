import { MainLayout } from "@/components/layout/Layout";
import { pb } from "@/config/pocketbaseConfig";
import { streamFetch } from "@/lib/fetchUtils";
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
import { useState } from "react";
import { useAiTextMessageRecordsStore } from "../aiTextMessages/aiTextMessageRecordsStore";
import { AiInputTextForm } from "./components/AiInputTextForm";

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
            {!aiTextRecords.map((x) => x.contentText).includes(streamedText) && (
              <AssistantTextMessage>{streamedText}</AssistantTextMessage>
            )}
            {mode === "error" && <ErrorMessage />}
          </div>
        </ScrollContainer>

        <div className="p-4 pt-1">
          {anthropicInstance ? (
            <AiInputTextForm
              disabled={mode === "thinking" || mode === "streaming"}
              onSubmit={async (x) => {
                setMode("thinking");

                const resp = await streamFetch({
                  url: "/api/submit-chat",
                  payload: {
                    method: "POST",
                    body: JSON.stringify({
                      token: pb.authStore.token,
                      prompt: x.text,
                      threadFriendlyId,
                    }),
                  },
                  onStream: (x) => {
                    setMode("streaming");
                    setStreamedText(() => x);
                  },
                });

                if (!resp.success) return setMode("error");

                setMode("ready");
                setStreamedText(() => resp.data);
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

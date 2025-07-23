import { create } from "zustand";
import { TAiTextMessageRecord } from "./dbAiTextMessageUtils";

type TState = TAiTextMessageRecord[] | undefined | null;

const useInitAiTextMessageRecordsStore = create<{
  data: TState;
  setData: (x: TState) => void;
  clear: () => void;
}>()((set) => ({
  data: undefined,
  setData: (data) => set(() => ({ data })),
  clear: () => set(() => ({ data: undefined })),
}));

export const useAiTextMessageRecordsStore = () => {
  const store = useInitAiTextMessageRecordsStore();

  return {
    ...store,
    getMessagesByThreadId: (threadId: string) => store.data?.filter((x) => x.threadId === threadId),
  };
};

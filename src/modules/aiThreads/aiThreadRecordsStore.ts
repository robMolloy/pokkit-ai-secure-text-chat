import { create } from "zustand";
import { TAiThreadRecord } from "./dbAiThreadRecordUtils";

type TState = TAiThreadRecord[] | undefined | null;

const useInitAiThreadRecordsStore = create<{
  data: TState;
  setData: (x: TState) => void;
  clear: () => void;
}>()((set) => ({
  data: undefined,
  setData: (data) => set(() => ({ data })),
  clear: () => set(() => ({ data: undefined })),
}));

export const useAiThreadRecordsStore = () => {
  const store = useInitAiThreadRecordsStore();

  return {
    ...store,
    getThreadsById: (threadId: string) => store.data?.find((x) => x.friendlyId === threadId),
  };
};

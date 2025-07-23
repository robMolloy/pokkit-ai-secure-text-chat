import { create } from "zustand";
import { TProviderRecord } from "./dbProviderRecordsUtils";

type TState = TProviderRecord[] | undefined | null;

const useInitProviderRecordsStore = create<{
  data: TState;
  setData: (x: TState) => void;
  clear: () => void;
}>()((set) => ({
  data: undefined,
  setData: (data) => set(() => ({ data })),
  clear: () => set(() => ({ data: undefined })),
}));

export const useProviderRecordsStore = () => {
  const store = useInitProviderRecordsStore();

  return {
    ...store,
    anthropic: store.data?.find((x) => x.provider === "anthropic"),
  };
};

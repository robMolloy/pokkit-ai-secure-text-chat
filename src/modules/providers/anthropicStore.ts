import { testAnthropicInstance } from "@/modules/providers/anthropicApi";
import { useProviderRecordsStore } from "@/modules/providers/providerRecordsStore";
import Anthropic from "@anthropic-ai/sdk";
import { useEffect } from "react";
import { create } from "zustand";

type TInitAnthropicState = Anthropic | null | undefined;
const useInitAnthropicStore = create<{
  data: TInitAnthropicState;
  setData: (data: TInitAnthropicState) => void;
}>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));

export const useAnthropicStore = () => {
  const initAnthropicStore = useInitAnthropicStore();

  return {
    data: initAnthropicStore.data,
    setData: initAnthropicStore.setData,
  };
};

export const useAnthropicStoreSync = () => {
  const initAnthropicStore = useInitAnthropicStore();

  const providerRecordsStore = useProviderRecordsStore();
  const anthropicRecord = providerRecordsStore.anthropic;

  useEffect(() => {
    if (!anthropicRecord?.apiKey) return initAnthropicStore.setData(null);

    initAnthropicStore.setData(undefined);

    const anthropic = new Anthropic({
      apiKey: anthropicRecord.apiKey,
      dangerouslyAllowBrowser: true,
    });

    (async () => {
      const resp = await testAnthropicInstance({ anthropic });

      initAnthropicStore.setData(resp.success ? anthropic : null);
    })();
  }, [anthropicRecord]);
};

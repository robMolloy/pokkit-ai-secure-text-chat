import { safeJsonParse } from "./utils";

type TFetchParams = Parameters<typeof fetch>;

export const streamFetch = async (p: {
  url: string;
  payload: TFetchParams[1];
  onStream: (x: string) => void;
}): Promise<{ success: true; data: string } | { success: false; error: unknown }> => {
  try {
    const strArray: string[] = [];
    const response = await fetch(p.url, p.payload);
    if (!response.ok) return { success: false, error: "Failed to start stream" };

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return { success: false, error: "No reader available" };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const jsonParseResp = safeJsonParse(chunk);
      if (jsonParseResp.success === false) return { success: false, error: "unable to parse data" };

      const message = jsonParseResp.data.message;
      if (message === undefined || message === null)
        return { success: false, error: "message is undefined or null" };

      strArray.push(message);
      p.onStream(strArray.join(""));
    }

    return { success: true, data: strArray.join("") };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
};

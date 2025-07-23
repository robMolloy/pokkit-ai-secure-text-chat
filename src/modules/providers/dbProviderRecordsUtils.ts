import PocketBase from "pocketbase";
import { z } from "zod";

const providerRecordSchema = z.object({
  collectionId: z.string(),
  collectionName: z.string(),
  id: z.string(),
  provider: z.string(),
  apiKey: z.string(),
  created: z.string(),
  updated: z.string(),
});
export type TProviderRecord = z.infer<typeof providerRecordSchema>;

export const listProviderRecords = async (p: { pb: PocketBase }) => {
  try {
    const initData = await p.pb.collection("aiProviders").getFullList({
      sort: "-created",
    });

    const data = initData
      .map((x) => providerRecordSchema.safeParse(x))
      .filter((x) => x.success)
      .map((x) => x.data);
    return { success: true, data } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const smartSubscribeToProviderRecords = async (p: {
  pb: PocketBase;
  onChange: (x: TProviderRecord[]) => void;
  onError: () => void;
}) => {
  const listProvidersResp = await listProviderRecords(p);
  if (!listProvidersResp.success) {
    p.onError();
    return listProvidersResp;
  }

  let allProviders = listProvidersResp.data;
  p.onChange(allProviders);

  try {
    const unsub = p.pb.collection("aiProviders").subscribe("*", (e) => {
      if (e.action === "create") {
        const parseResp = providerRecordSchema.safeParse(e.record);
        if (parseResp.success) allProviders.push(parseResp.data);
      }
      if (e.action === "update") {
        const parseResp = providerRecordSchema.safeParse(e.record);
        if (!parseResp.success) return;

        allProviders = allProviders.filter((x) => parseResp.data?.id !== x.id);
        allProviders.push(parseResp.data);
      }
      if (e.action === "delete") {
        const parseResp = providerRecordSchema.safeParse(e.record);
        if (!parseResp.success) return;

        allProviders = allProviders.filter((x) => parseResp.data?.id !== x.id);
      }
      p.onChange(allProviders);
    });

    return { success: true, data: unsub } as const;
  } catch (error) {
    p.onError();
    return { success: false, error } as const;
  }
};

export const createProviderRecord = async (p: {
  pb: PocketBase;
  data: Omit<
    TProviderRecord,
    "collectionId" | "collectionName" | "id" | "value" | "created" | "updated"
  >;
}) => {
  try {
    const resp = await p.pb.collection("aiProviders").create(p.data);
    return { success: true, data: resp } as const;
  } catch (error) {
    console.error(error);
    return { success: false, error } as const;
  }
};

export const updateProviderRecord = async (p: {
  pb: PocketBase;
  data: Omit<TProviderRecord, "collectionId" | "collectionName" | "created" | "updated">;
}) => {
  try {
    const resp = await p.pb.collection("aiProviders").update(p.data.id, p.data);
    return { success: true, data: resp } as const;
  } catch (error) {
    console.error(error);
    return { success: false, error } as const;
  }
};

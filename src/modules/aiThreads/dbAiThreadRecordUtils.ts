import { z } from "zod";
import PocketBase from "pocketbase";

const aiThreadRecordSchema = z.object({
  collectionId: z.string(),
  collectionName: z.string(),
  id: z.string(),
  title: z.string(),
  friendlyId: z.string(),
  created: z.string(),
  updated: z.string(),
});
export type TAiThreadRecord = z.infer<typeof aiThreadRecordSchema>;

const collectionName = "aiThreads";

export const createAiThreadRecord = async (p: {
  pb: PocketBase;
  data: Omit<TAiThreadRecord, "collectionId" | "collectionName" | "id" | "created" | "updated">;
}) => {
  try {
    const resp = await p.pb.collection(collectionName).create(p.data);
    return aiThreadRecordSchema.safeParse(resp);
  } catch (error) {
    console.error(error);
    return { success: false, error } as const;
  }
};

export const listAiThreadRecords = async (p: { pb: PocketBase }) => {
  try {
    const initData = await p.pb.collection(collectionName).getFullList({
      sort: "-created",
    });

    const data = initData
      .map((x) => aiThreadRecordSchema.safeParse(x))
      .filter((x) => x.success)
      .map((x) => x.data);
    return { success: true, data } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const smartSubscribeToAiThreadRecords = async (p: {
  pb: PocketBase;
  onChange: (x: TAiThreadRecord[]) => void;
  onError: () => void;
}) => {
  const listAiThreadRecordsResp = await listAiThreadRecords(p);
  if (!listAiThreadRecordsResp.success) {
    p.onError();
    return listAiThreadRecordsResp;
  }

  let allRecords = listAiThreadRecordsResp.data;
  p.onChange(allRecords);

  try {
    const unsub = p.pb.collection(collectionName).subscribe("*", (e) => {
      if (e.action === "create") {
        const parseResp = aiThreadRecordSchema.safeParse(e.record);
        if (parseResp.success) allRecords.push(parseResp.data);
      }
      if (e.action === "update") {
        const parseResp = aiThreadRecordSchema.safeParse(e.record);
        if (!parseResp.success) return;

        allRecords = allRecords.filter((x) => parseResp.data?.id !== x.id);
        allRecords.push(parseResp.data);
      }
      if (e.action === "delete") {
        const parseResp = aiThreadRecordSchema.safeParse(e.record);
        if (!parseResp.success) return;

        allRecords = allRecords.filter((x) => parseResp.data?.id !== x.id);
      }
      p.onChange(allRecords);
    });

    return { success: true, data: unsub } as const;
  } catch (error) {
    p.onError();
    return { success: false, error } as const;
  }
};

export const updateAiThreadRecordTitle = async (p: {
  pb: PocketBase;
  id: string;
  title: TAiThreadRecord["title"];
}) => {
  try {
    const resp = await p.pb.collection(collectionName).update(p.id, { title: p.title });
    return { success: true, data: resp } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};

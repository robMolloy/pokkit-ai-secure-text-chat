import { z } from "zod";
import PocketBase from "pocketbase";

const aiTextMessageRecordSchema = z.object({
  collectionId: z.string(),
  collectionName: z.string(),
  id: z.string(),
  threadId: z.string(),
  role: z.enum(["user", "assistant"]),
  contentText: z.string(),
  created: z.string(),
  updated: z.string(),
});
export type TAiTextMessageRecord = z.infer<typeof aiTextMessageRecordSchema>;

const collectionName = "aiTextMessages";

export const createAiTextMessageRecord = async (p: {
  pb: PocketBase;
  data: Omit<
    TAiTextMessageRecord,
    "collectionId" | "collectionName" | "id" | "created" | "updated"
  >;
}) => {
  try {
    const resp = await p.pb.collection(collectionName).create(p.data);
    return aiTextMessageRecordSchema.safeParse(resp);
  } catch (error) {
    console.error(error);
    return { success: false, error } as const;
  }
};
export const listAiTextMessageRecords = async (p: { pb: PocketBase }) => {
  try {
    const initData = await p.pb.collection(collectionName).getFullList({
      sort: "-created",
    });

    const data = initData
      .map((x) => aiTextMessageRecordSchema.safeParse(x))
      .filter((x) => x.success)
      .map((x) => x.data);
    return { success: true, data } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const smartSubscribeToAiTextMessageRecords = async (p: {
  pb: PocketBase;
  onChange: (x: TAiTextMessageRecord[]) => void;
  onError: () => void;
}) => {
  const listAiTextMessageRecordsResp = await listAiTextMessageRecords(p);
  if (!listAiTextMessageRecordsResp.success) {
    p.onError();
    return listAiTextMessageRecordsResp;
  }

  let allRecords = listAiTextMessageRecordsResp.data;
  p.onChange(allRecords);

  try {
    const unsub = p.pb.collection(collectionName).subscribe("*", (e) => {
      if (e.action === "create") {
        const parseResp = aiTextMessageRecordSchema.safeParse(e.record);
        if (parseResp.success) allRecords.push(parseResp.data);
      }
      if (e.action === "update") {
        const parseResp = aiTextMessageRecordSchema.safeParse(e.record);
        if (!parseResp.success) return;

        allRecords = allRecords.filter((x) => parseResp.data?.id !== x.id);
        allRecords.push(parseResp.data);
      }
      if (e.action === "delete") {
        const parseResp = aiTextMessageRecordSchema.safeParse(e.record);
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

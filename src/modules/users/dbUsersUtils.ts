import PocketBase, { RecordModel, RecordSubscription } from "pocketbase";
import { z } from "zod";

export const userSchema = z.object({
  collectionId: z.string(),
  collectionName: z.literal("users"),
  id: z.string(),
  email: z.string(),
  name: z.string(),
  status: z.enum(["pending", "admin", "approved", "denied"]),
  created: z.string(),
  updated: z.string(),
});
export type TUser = z.infer<typeof userSchema>;

export const listUsers = async (p: { pb: PocketBase }) => {
  try {
    const initData = await p.pb.collection("users").getFullList();

    const data = initData
      .map((x) => userSchema.safeParse(x))
      .filter((x) => x.success)
      .map((x) => x.data);
    return { success: true, data } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const subscribeToUsers = async (p: {
  pb: PocketBase;
  onCreateUser: (e: RecordSubscription<RecordModel>) => void;
  onUpdateUser: (e: RecordSubscription<RecordModel>) => void;
}) => {
  p.pb.collection("users").subscribe("*", (e) => {
    if (e.action) p.onCreateUser(e);
  });
  return { success: true } as const;
};

export const getUser = async (p: { pb: PocketBase; id: string }) => {
  try {
    const userResp = await p.pb.collection("users").getOne(p.id);
    return userSchema.safeParse(userResp);
  } catch (e) {
    const error = e as { message: string };
    return { success: false, error } as const;
  }
};
export const subscribeToUser = async (p: {
  pb: PocketBase;
  id: string;
  onChange: (e: TUser | null) => void;
}) => {
  try {
    const userResp = await getUser(p);
    p.onChange(userResp.success ? userResp.data : null);

    const unsub = p.pb.collection("users").subscribe(p.id, (e) => {
      const parseResp = userSchema.safeParse(e.record);
      p.onChange(parseResp.success ? parseResp.data : null);
    });

    return { success: true, data: unsub } as const;
  } catch (error) {
    p.onChange(null);
    return { success: false, error } as const;
  }
};

export const smartSubscribeToUsers = async (p: {
  pb: PocketBase;
  onChange: (x: TUser[]) => void;
}) => {
  const listUsersResp = await listUsers(p);
  if (!listUsersResp.success) return listUsersResp;

  let allDocs = listUsersResp.data;
  p.onChange(allDocs);
  const unsub = p.pb.collection("users").subscribe("*", (e) => {
    if (e.action === "create") {
      const parseResp = userSchema.safeParse(e.record);
      if (parseResp.success) allDocs.push(parseResp.data);
    }
    if (e.action === "update") {
      const parseResp = userSchema.safeParse(e.record);
      if (!parseResp.success) return;

      allDocs = allDocs.filter((x) => parseResp.data?.id !== x.id);
      allDocs.push(parseResp.data);
    }
    if (e.action === "delete") {
      const parseResp = userSchema.safeParse(e.record);
      if (!parseResp.success) return;

      allDocs = allDocs.filter((x) => parseResp.data?.id !== x.id);
    }
    p.onChange(allDocs);
  });

  return { success: true, data: unsub } as const;
};

export const updateUserStatus = async (p: {
  pb: PocketBase;
  id: string;
  status: TUser["status"];
}) => {
  try {
    const resp = await p.pb.collection("users").update(p.id, { status: p.status });
    return { success: true, data: resp } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const deleteUser = async (p: { pb: PocketBase; id: string }) => {
  try {
    await p.pb.collection("users").delete(p.id);
    return { success: true } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};

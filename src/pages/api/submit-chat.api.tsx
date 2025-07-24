import { pb, PocketBase } from "@/config/pocketbaseConfig";
import { userSchema } from "@/modules/users/dbUsersUtils";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const verifyPbAuthToken = async (
  p: { pb: PocketBase; token: string } | { pbBaseUrl: string; token: string },
) => {
  try {
    const newPbInstance = new PocketBase("pb" in p ? p.pb.baseURL : p.pbBaseUrl);
    newPbInstance.authStore.save(p.token, null);

    if (!newPbInstance.authStore.isValid)
      return { success: false, error: "Invalid token" } as const;

    await newPbInstance.collection("users").authRefresh();
    return { success: true, data: newPbInstance } as const;
  } catch (e) {
    const error = e as { message: string };
    return { success: false, error: error.message } as const;
  }
};

const safeJsonParse = (p: unknown) => {
  try {
    return { success: true, data: JSON.parse(p as string) } as const;
  } catch (e) {
    return { success: false, error: "invalid json" } as const;
  }
};

const reqSchema = z.object({ token: z.string() });

const handler = async (req: NextApiRequest, res: NextApiResponse<unknown>) => {
  const resp = await (async () => {
    if (req.method !== "POST") return { success: false, error: "method not allowed" } as const;

    const jsonResp = safeJsonParse(req.body);
    if (!jsonResp.success) return jsonResp;

    const parsedBody = reqSchema.safeParse(jsonResp.data);

    console.log(`submit-chat.api.tsx:${/*LL*/ 34}`, req.body);

    if (!parsedBody.success) return { success: false, error: "invalid request body" } as const;

    const userPbResp = await verifyPbAuthToken({ pb, token: parsedBody.data.token });

    if (!userPbResp.success) return userPbResp;

    const initUserRecord = userPbResp.data.authStore.record;

    const parsedUserRecord = userSchema.safeParse(initUserRecord);
    if (!parsedUserRecord.success) return { success: false, error: "invalid user record" } as const;

    const userRecord = parsedUserRecord.data;

    if (userRecord.status !== "approved" && userRecord.status !== "admin")
      return { success: false, error: "user must be approved or admin" } as const;

    return { success: true } as const;
  })();

  if (!resp.success) console.error(resp.error);

  if (resp.success) return res.status(200).json({ name: "John Doe" });

  if (resp.error === "method not allowed")
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  res.status(401).end(resp.error);
};

export default handler;

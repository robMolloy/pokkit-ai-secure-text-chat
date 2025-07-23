import { TUser, userSchema } from "@/modules/users/dbUsersUtils";
import PocketBase from "pocketbase";
import { useEffect } from "react";
import { z } from "zod";
import { create } from "zustand";

const pocketbaseAuthStoreSchema = z.object({
  token: z.string(),
  record: userSchema,
});
type TAuth = z.infer<typeof pocketbaseAuthStoreSchema>;

type TState = { status: "loading" | "loggedOut" } | { status: "loggedIn"; auth: TAuth };

export const useUnverifiedIsLoggedInStore = create<{
  data: TState;
  setData: (x: TState) => void;
}>()((set) => ({
  data: { status: "loading" },
  setData: (data) => set(() => ({ data })),
}));

export const useUnverifiedIsLoggedInSync = (p: { pb: PocketBase }) => {
  const isLoggedInStore = useUnverifiedIsLoggedInStore();
  useEffect(() => {
    if (!p.pb.authStore.isValid) return isLoggedInStore.setData({ status: "loggedOut" });

    const resp = pocketbaseAuthStoreSchema.safeParse(p.pb.authStore);
    isLoggedInStore.setData(
      resp.success ? { status: "loggedIn", auth: resp.data } : { status: "loggedOut" },
    );
  }, []);

  useEffect(() => {
    p.pb.authStore.onChange(() => {
      if (!p.pb.authStore.isValid) return isLoggedInStore.setData({ status: "loggedOut" });

      const resp = pocketbaseAuthStoreSchema.safeParse(p.pb.authStore);
      isLoggedInStore.setData(
        resp.success ? { status: "loggedIn", auth: resp.data } : { status: "loggedOut" },
      );
    });
  }, []);
};

type TCurrentUserState = { status: "loading" | "loggedOut" } | { status: "loggedIn"; user: TUser };

export const useCurrentUserStore = create<{
  data: TCurrentUserState;
  setData: (x: TCurrentUserState) => void;
}>()((set) => ({
  data: { status: "loading" },
  setData: (data) => set(() => ({ data })),
}));

import PocketBase from "pocketbase";

export const checkAuth = (p: { pb: PocketBase }) => {
  const authStore = p.pb.authStore;
  if (!authStore?.token) return { success: false, error: "authStore is null" } as const;
  return { success: true, data: authStore } as const;
};

export const loginWithPassword = async (p: { pb: PocketBase; email: string; password: string }) => {
  try {
    await p.pb.collection("users").authWithPassword(p.email, p.password);

    return checkAuth({ pb: p.pb });
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const logout = (p: { pb: PocketBase }) => {
  p.pb.realtime.unsubscribe();
  p.pb.authStore.clear();
  return { success: true } as const;
};

export const createUser = async (p: {
  pb: PocketBase;
  data: { email: string; password: string };
}) => {
  try {
    const resp = await p.pb
      .collection("users")
      .create({ ...p.data, passwordConfirm: p.data.password });
    return { success: true, data: resp } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};

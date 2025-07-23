import PocketBase from "pocketbase";

const pbInstanceMap = {
  pbLocal: () => new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL),
  pbRemote: () => new PocketBase("https://romolo.pockethost.io"),
};

export const pb = pbInstanceMap.pbLocal();

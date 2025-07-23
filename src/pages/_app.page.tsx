import { Layout } from "@/components/layout/Layout";
import { pb } from "@/config/pocketbaseConfig";
import { useAiTextMessageRecordsStore } from "@/modules/aiTextMessages/aiTextMessageRecordsStore";
import { smartSubscribeToAiTextMessageRecords } from "@/modules/aiTextMessages/dbAiTextMessageUtils";
import { useAiThreadRecordsStore } from "@/modules/aiThreads/aiThreadRecordsStore";
import { smartSubscribeToAiThreadRecords } from "@/modules/aiThreads/dbAiThreadRecordUtils";
import { AuthForm } from "@/modules/auth/AuthForm";
import { useAnthropicStoreSync } from "@/modules/providers/anthropicStore";
import { smartSubscribeToProviderRecords } from "@/modules/providers/dbProviderRecordsUtils";
import { useProviderRecordsStore } from "@/modules/providers/providerRecordsStore";
import { smartSubscribeToUsers, subscribeToUser } from "@/modules/users/dbUsersUtils";
import { useUsersStore } from "@/modules/users/usersStore";
import { LoadingScreen } from "@/screens/LoadingScreen";
import {
  useCurrentUserStore,
  useUnverifiedIsLoggedInStore,
  useUnverifiedIsLoggedInSync,
} from "@/stores/authDataStore";
import { useThemeStore } from "@/stores/themeStore";
import "@/styles/globals.css";
import "@/styles/markdown.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

const useAuth = (p: {
  onIsLoading: () => void;
  onIsLoggedIn: () => void;
  onIsLoggedOut: () => void;
}) => {
  const unverifiedIsLoggedInStore = useUnverifiedIsLoggedInStore();

  const currentUserStore = useCurrentUserStore();

  useUnverifiedIsLoggedInSync({ pb });

  useEffect(() => {
    // use anfn as return value is not cleanup
    (() => {
      if (unverifiedIsLoggedInStore.data.status === "loggedOut")
        return currentUserStore.setData({ status: "loggedOut" });

      if (unverifiedIsLoggedInStore.data.status === "loading")
        return currentUserStore.setData({ status: "loading" });

      if (unverifiedIsLoggedInStore.data.status !== "loggedIn")
        return console.error("should never be hit");

      return subscribeToUser({
        pb,
        id: unverifiedIsLoggedInStore.data.auth.record.id,
        onChange: (user) => {
          if (user) currentUserStore.setData({ status: "loggedIn", user });
          else currentUserStore.setData({ status: "loggedOut" });
        },
      });
    })();
  }, [unverifiedIsLoggedInStore.data]);

  useEffect(() => {
    if (currentUserStore.data.status === "loading") return p.onIsLoading();
    if (currentUserStore.data.status === "loggedIn") return p.onIsLoggedIn();
    if (currentUserStore.data.status === "loggedOut") return p.onIsLoggedOut();

    console.error("should never be hit");
  }, [currentUserStore.data]);

  return currentUserStore.data;
};

export default function App({ Component, pageProps }: AppProps) {
  const themeStore = useThemeStore();
  const usersStore = useUsersStore();
  const providerRecordsStore = useProviderRecordsStore();
  const currentUserStore = useCurrentUserStore();
  const aiThreadRecordsStore = useAiThreadRecordsStore();
  const aiTextMessageRecordsStore = useAiTextMessageRecordsStore();

  themeStore.useThemeStoreSideEffect();

  useAnthropicStoreSync();

  useAuth({
    onIsLoading: () => {},
    onIsLoggedIn: () => {
      smartSubscribeToUsers({ pb, onChange: (x) => usersStore.setData(x) });
      smartSubscribeToProviderRecords({
        pb,
        onChange: (x) => providerRecordsStore.setData(x),
        onError: () => providerRecordsStore.setData(null),
      });
      smartSubscribeToAiThreadRecords({
        pb,
        onChange: (x) => aiThreadRecordsStore.setData(x),
        onError: () => aiThreadRecordsStore.setData(null),
      });
      smartSubscribeToAiTextMessageRecords({
        pb,
        onChange: (x) => aiTextMessageRecordsStore.setData(x),
        onError: () => aiTextMessageRecordsStore.setData(null),
      });
    },
    onIsLoggedOut: () => {},
  });

  return (
    <>
      <Head>
        <title>Pokkit AI - open text chat</title>
      </Head>
      <Layout
        showLeftSidebar={
          currentUserStore.data.status === "loggedIn" &&
          ["approved", "admin"].includes(currentUserStore.data.user.status)
        }
      >
        {(() => {
          if (currentUserStore.data.status === "loading") return <LoadingScreen />;

          if (currentUserStore.data.status === "loggedOut")
            return (
              <div className="mt-16 flex justify-center">
                <AuthForm />
              </div>
            );

          // should not be required
          if (currentUserStore.data.status !== "loggedIn") {
            console.error(`this line should never be hit`);
            return;
          }

          if (currentUserStore.data.user.status === "pending") return <div>awaiting approval</div>;

          if (currentUserStore.data.user.status === "denied") return <div>blocked</div>;

          return <Component {...pageProps} />;
        })()}
      </Layout>
    </>
  );
}

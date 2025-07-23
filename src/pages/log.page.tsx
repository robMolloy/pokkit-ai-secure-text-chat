import { useProviderRecordsStore } from "@/modules/providers/providerRecordsStore";
import { useUsersStore } from "@/modules/users/usersStore";
import { useCurrentUserStore, useUnverifiedIsLoggedInStore } from "@/stores/authDataStore";

const LogPage = () => {
  const usersStore = useUsersStore();
  const currentUserStore = useCurrentUserStore();
  const unverifiedIsLoggedInStore = useUnverifiedIsLoggedInStore();
  const providerRecordsStore = useProviderRecordsStore();

  return (
    <div>
      <pre>
        {JSON.stringify(
          { usersStore, currentUserStore, unverifiedIsLoggedInStore, providerRecordsStore },
          undefined,
          2,
        )}
      </pre>
    </div>
  );
};

export default LogPage;

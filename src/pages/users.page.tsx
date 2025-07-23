import { ConfirmationModalContent } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderRow,
  TableRow,
} from "@/components/ui/table";
import { pb } from "@/config/pocketbaseConfig";
import { deleteUser, TUser, updateUserStatus } from "@/modules/users/dbUsersUtils";
import { useUsersStore } from "@/modules/users/usersStore";
import { useCurrentUserStore } from "@/stores/authDataStore";
import { useModalStore } from "@/stores/modalStore";
import { CustomIcon } from "@/components/CustomIcon";
import { MainLayout } from "@/components/layout/Layout";
import { H1 } from "@/components/ui/defaultComponents";

type TUserStatus = TUser["status"];
const statusColorClassMap: { [k in TUserStatus]: string } = {
  pending: "bg-muted",
  admin: "bg-purple-600",
  approved: "bg-green-500",
  denied: "bg-destructive",
} as const;

const UserStateSelect = (p: {
  user: TUser;
  onStatusChange: (x: TUser) => void;
  disabled?: boolean;
}) => {
  return (
    <>
      <Select
        value={p.user.status}
        onValueChange={(status: TUserStatus) => p.onStatusChange({ ...p.user, status })}
        disabled={p.disabled}
      >
        <SelectTrigger className={`w-[180px] ${statusColorClassMap[p.user.status]}`}>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {p.user.status === "pending" && <SelectItem value="pending">Pending</SelectItem>}
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="denied">Denied</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
};

const UsersPage = () => {
  const usersStore = useUsersStore();
  const modalStore = useModalStore();
  const currentUserStore = useCurrentUserStore();

  return (
    <MainLayout>
      <H1>Users</H1>
      <br />
      <Table>
        <TableHeader>
          <TableHeaderRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableHeaderRow>
        </TableHeader>
        <TableBody>
          {usersStore.data.map((user) => {
            const userOwnsRecord =
              currentUserStore.data.status === "loggedIn" &&
              user.id === currentUserStore.data.user.id;
            return (
              <TableRow key={user.id} className={userOwnsRecord ? "bg-muted" : ""}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <UserStateSelect
                    user={user}
                    disabled={userOwnsRecord}
                    onStatusChange={async (user: TUser) => {
                      modalStore.setData(
                        <ConfirmationModalContent
                          title="Update status"
                          description={`Are you sure you want to change the status of ${user.name} to ${user.status}?`}
                          onConfirm={() =>
                            updateUserStatus({ pb, id: user.id, status: user.status })
                          }
                        />,
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  {!userOwnsRecord && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        modalStore.setData(
                          <ConfirmationModalContent
                            title="Delete user"
                            description={`Are you sure you want to delete ${user.name}? This action cannot be undone.`}
                            onConfirm={() => deleteUser({ pb, id: user.id })}
                          />,
                        );
                      }}
                    >
                      <CustomIcon iconName="Trash2" size="md" className="text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </MainLayout>
  );
};

export default UsersPage;

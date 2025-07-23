import { Button } from "@/components/ui/button";
import { pb } from "@/config/pocketbaseConfig";
import { logout } from "@/modules/auth/dbAuthUtils";
import { useUsersStore } from "@/modules/users/usersStore";
import { useAnthropicStore } from "@/modules/providers/anthropicStore";
import { useCurrentUserStore } from "@/stores/authDataStore";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { CustomIcon } from "../CustomIcon";
import { useAiThreadRecordsStore } from "@/modules/aiThreads/aiThreadRecordsStore";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Tooltip } from "@radix-ui/react-tooltip";
import { MainLayout } from "./Layout";

const uuid = () => crypto.randomUUID();

const SidebarButtonWrapper = (p: { children: ReactNode; href?: string; disabled?: boolean }) => {
  return p.href ? (
    <Link href={p.disabled ? "#" : p.href} className={p.disabled ? "pointer-events-none" : ""}>
      {p.children}
    </Link>
  ) : (
    p.children
  );
};

const PossibleTooltipWrapper = (p: { children: ReactNode; tooltipContent?: React.ReactNode }) => {
  return p.tooltipContent ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{p.children}</TooltipTrigger>
        <TooltipContent>{p.tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <>{p.children}</>
  );
};

const SidebarButton = (p: {
  href?: string;
  iconName?: React.ComponentProps<typeof CustomIcon>["iconName"];
  children: ReactNode;
  isHighlighted: boolean;
  onClick?: () => void;
  badgeCount?: number;
  disabled?: boolean;
  tooltipContent?: React.ReactNode;
}) => {
  return (
    <SidebarButtonWrapper href={p.href} disabled={p.disabled}>
      <PossibleTooltipWrapper tooltipContent={p.tooltipContent}>
        <Button
          variant={p.isHighlighted ? "secondary" : "ghost"}
          className={`w-full ${p.disabled ? "pointer-events-none" : ""}`}
          onClick={p.onClick}
          disabled={p.disabled}
        >
          <span className="flex w-full items-center gap-2 text-left">
            {p.iconName && (
              <CustomIcon
                iconName={p.iconName}
                size="sm"
                className={p.disabled ? "text-muted-foreground" : ""}
              />
            )}

            {p.children}

            {p.badgeCount !== undefined && p.badgeCount > 0 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                {p.badgeCount}
              </span>
            )}
          </span>
        </Button>
      </PossibleTooltipWrapper>
    </SidebarButtonWrapper>
  );
};

export function LeftSidebar() {
  const router = useRouter();
  const aiThreadRecordsStore = useAiThreadRecordsStore();
  const threadFriendlyId = router.query.threadFriendlyId as string;

  const currentThread = aiThreadRecordsStore.data?.find((x) => x.friendlyId === threadFriendlyId);

  const currentUserStore = useCurrentUserStore();
  const usersStore = useUsersStore();
  const pendingUsersCount = usersStore.data.filter((user) => user.status === "pending").length;

  const anthropicStore = useAnthropicStore();
  return (
    <MainLayout fillPageExactly padding={false}>
      <div className="flex h-full flex-col">
        <div className="border-b p-2">
          <div className="flex flex-col gap-1">
            <SidebarButton href="/" iconName={"Home"} isHighlighted={router.pathname === "/"}>
              Home
            </SidebarButton>

            <SidebarButton
              disabled={!anthropicStore.data}
              iconName="Brain"
              isHighlighted={!currentThread && !!threadFriendlyId}
              onClick={() => router.push(`/ai-chat/${uuid()}`)}
            >
              AI Chat
            </SidebarButton>
          </div>
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-0 flex flex-col gap-1 overflow-y-auto p-2">
            {aiThreadRecordsStore.data
              ?.sort((a, b) => (a.updated < b.updated ? 1 : -1))
              .map((x) => {
                const label = x.title ? x.title : x.friendlyId;
                return (
                  <SidebarButton
                    key={x.friendlyId}
                    disabled={!anthropicStore.data}
                    isHighlighted={x.friendlyId === threadFriendlyId}
                    onClick={() => router.push(`/ai-chat/${x.friendlyId}`)}
                    tooltipContent={label}
                  >
                    <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {label}
                    </div>
                  </SidebarButton>
                );
              })}
          </div>
        </div>

        <div className="border-t p-2">
          <div className="flex flex-col gap-1">
            {currentUserStore.data.status === "loggedIn" &&
              currentUserStore.data.user.status === "admin" && (
                <SidebarButton
                  href="/users"
                  iconName="Users"
                  isHighlighted={router.pathname === "/users"}
                  badgeCount={pendingUsersCount}
                >
                  Users
                </SidebarButton>
              )}
            {currentUserStore.data.status === "loggedIn" &&
              currentUserStore.data.user.status === "admin" && (
                <SidebarButton
                  href="/providers"
                  isHighlighted={router.pathname === "/providers"}
                  iconName="Brain"
                >
                  Providers
                </SidebarButton>
              )}
            <SidebarButton iconName="LogOut" isHighlighted={false} onClick={() => logout({ pb })}>
              Log Out
            </SidebarButton>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

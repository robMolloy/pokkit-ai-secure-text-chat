import { CustomIcon } from "@/components/CustomIcon";
import { MainLayout } from "@/components/layout/Layout";
import { H1 } from "@/components/ui/defaultComponents";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { pb } from "@/config/pocketbaseConfig";
import {
  createProviderRecord,
  updateProviderRecord,
} from "@/modules/providers/dbProviderRecordsUtils";
import { LoadingScreen } from "@/screens/LoadingScreen";
import { useAnthropicStore } from "@/modules/providers/anthropicStore";
import { debounce } from "lodash";
import { useState } from "react";
import { useProviderRecordsStore } from "../modules/providers/providerRecordsStore";
import { ErrorScreen } from "@/screens/ErrorScreen";

const debouncedUpdate = debounce(
  (p: Parameters<typeof updateProviderRecord>[0]) => updateProviderRecord(p),
  1000,
);

export const SettingItem = (p: {
  title: string;
  description: string;
  disabledTooltip?: string;
  children?: React.ReactNode;
}) => {
  const content = (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg">{p.title}</h2>
        <p className="text-sm text-gray-500">{p.description}</p>
      </div>
      {p.children}
    </div>
  );

  if (!!p.disabledTooltip) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-not-allowed opacity-50">{content}</div>
          </TooltipTrigger>
          <TooltipContent sideOffset={-30}>
            <p>{p.disabledTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

const ProvidersScreen = () => {
  const providersStore = useProviderRecordsStore();

  const anthropic = providersStore.anthropic;

  const anthropicStore = useAnthropicStore();

  const [anthropicApiKey, setAnthropicApiKey] = useState(anthropic?.apiKey ?? "");

  if (providersStore.data === undefined) return <LoadingScreen />;

  if (providersStore.data === null) return <ErrorScreen />;

  return (
    <>
      <H1>Providers</H1>

      <div>
        <SettingItem title="Anthropic API Key" description="API key for Anthropic">
          <div className="flex flex-col items-end justify-end gap-2">
            <div className="flex items-center gap-2">
              <Input
                value={anthropicApiKey}
                onChange={async (e) => {
                  const apiKey = e.target.value;
                  setAnthropicApiKey(apiKey);

                  anthropicStore.setData(undefined);

                  if (anthropic) return debouncedUpdate({ pb, data: { ...anthropic, apiKey } });

                  createProviderRecord({ pb, data: { provider: "anthropic", apiKey } });
                }}
              />
              {anthropicStore.data && (
                <CustomIcon iconName="Check" className="text-success" size="sm" />
              )}
              {anthropicStore.data === null && (
                <CustomIcon iconName="X" className="text-destructive" size="sm" />
              )}
              {anthropicStore.data === undefined && (
                <CustomIcon iconName="Loader" size="sm" className="animate-spin" />
              )}
            </div>
          </div>
        </SettingItem>
      </div>
    </>
  );
};

const ProvidersPage = () => {
  const providersStore = useProviderRecordsStore();

  return (
    <MainLayout>
      {providersStore.data === undefined && <LoadingScreen />}
      {providersStore.data !== undefined && <ProvidersScreen />}
    </MainLayout>
  );
};

export default ProvidersPage;

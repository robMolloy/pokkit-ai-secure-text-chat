import { useState } from "react";
import { useEffect } from "react";
import { Switch } from "./ui/switch";

export const OptimisticSwitch = (p: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => Promise<{ success: boolean }>;
  disabled?: boolean;
}) => {
  const [isChecked, setIsChecked] = useState(p.checked);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => setIsChecked(p.checked), [p.checked]);

  return (
    <Switch
      checked={isChecked}
      disabled={p.disabled}
      onCheckedChange={async (x) => {
        if (isLoading) return;
        setIsLoading(true);
        const originalIsChecked = isChecked;
        setIsChecked(!originalIsChecked);

        const resp = await p.onCheckedChange(x);
        if (!resp.success) setIsChecked(originalIsChecked);

        setIsLoading(false);
      }}
    />
  );
};

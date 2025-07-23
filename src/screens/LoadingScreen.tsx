import React from "react";
import { Spinner } from "@/components/ui/spinner";

export const LoadingScreen = () => {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
};

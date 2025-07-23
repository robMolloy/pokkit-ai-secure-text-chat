import { CustomIcon } from "@/components/CustomIcon";
import { Card, CardContent } from "@/components/ui/card";
import Markdown from "react-markdown";

export const AssistantTextMessage = (p: { children: string }) => {
  return (
    <div className="react-markdown">
      <Markdown>{p.children}</Markdown>
    </div>
  );
};

export const UserTextMessage = (p: { children: string }) => {
  return (
    <div className="flex items-start">
      <Card>
        <CardContent className="p-2">
          <div className="react-markdown">
            <Markdown>{p.children}</Markdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ErrorMessage = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="/10 w-full max-w-md border-destructive">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <CustomIcon iconName="X" size="sm" />
          </div>
          <p className="font-medium">There has been an error processing your request.</p>
        </CardContent>
      </Card>
    </div>
  );
};

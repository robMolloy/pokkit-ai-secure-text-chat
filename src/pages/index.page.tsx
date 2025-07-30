import { MainLayout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/defaultComponents";
import { pb } from "@/config/pocketbaseConfig";
import { streamFetch } from "@/lib/fetchUtils";
import { useState } from "react";

export default function Home() {
  const [response, setResponse] = useState("");
  return (
    <MainLayout>
      <H1>Welcome to Pokkit AI</H1>
      <br />
      <p className="text-muted-foreground">
        This is your dashboard. Start adding your content here.
      </p>
      <Button
        onClick={async () => {
          setResponse("");
          const response = await streamFetch({
            url: "/api/submit-chat-incremental",
            payload: { method: "POST", body: JSON.stringify({ token: pb.authStore.token }) },
            onStream: (x) => setResponse(x),
          });
          console.log(`index.page.tsx:${/*LL*/ 70}`, response);
        }}
      >
        Submit a chat
      </Button>
      <div>{response}</div>
      {/* <pre>{JSON.stringify(response, undefined, 2)}</pre> */}
    </MainLayout>
  );
}

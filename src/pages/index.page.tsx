import { MainLayout } from "@/components/layout/Layout";
import { H1 } from "@/components/ui/defaultComponents";

export default function Home() {
  return (
    <MainLayout>
      <H1>Welcome to Pokkit AI</H1>
      <br />
      <p className="text-muted-foreground">
        This is your dashboard. Start adding your content here.
      </p>
    </MainLayout>
  );
}

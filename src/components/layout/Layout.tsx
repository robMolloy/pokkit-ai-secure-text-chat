import { Header } from "./Header";
import { LeftSidebar } from "./LeftSidebar";
import { Modal } from "../Modal";

export const MainLayout = (p: {
  children: React.ReactNode;
  padding?: boolean;
  fillPageExactly?: boolean;
}) => {
  const padding = p.padding ?? true;
  return (
    <div className={`${p.fillPageExactly ? "h-full" : "min-h-full"} ${padding ? "p-6" : ""}`}>
      {p.children}
    </div>
  );
};

export function Layout(p: { children: React.ReactNode; showLeftSidebar: boolean }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        {p.showLeftSidebar && (
          <aside className="min-h-full w-96 overflow-y-auto border-r">
            <LeftSidebar />
          </aside>
        )}
        <main className="min-h-full w-full overflow-y-auto">{p.children}</main>
      </div>
      <Modal />
    </div>
  );
}

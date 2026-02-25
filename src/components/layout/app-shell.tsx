import { SideNav } from "@/components/layout/side-nav";
import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh bg-background">
      <div className="mx-auto flex h-dvh max-w-[1440px]">
        <SideNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}


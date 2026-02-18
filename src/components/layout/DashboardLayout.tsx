import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — fixed, hover-expand */}
      <AppSidebar />

      {/* Top navbar — fixed, offset by collapsed sidebar width (72px) */}
      <TopNavbar pageTitle={pageTitle} />

      {/* Main content — offset by sidebar collapsed width + navbar height */}
      <main className="ml-[72px] pt-16 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

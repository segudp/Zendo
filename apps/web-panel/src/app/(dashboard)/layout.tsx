import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

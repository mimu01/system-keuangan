import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { QueryProvider } from "@/components/admin/query-provider";
import { DashboardShell } from "./dashboard-shell";

export const metadata = {
  title: "Dashboard Admin — SIK MI Miftahul Ulum 01",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin");
  }

  return (
    <QueryProvider>
      <DashboardShell admin={admin}>{children}</DashboardShell>
    </QueryProvider>
  );
}

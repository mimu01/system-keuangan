import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Masuk Admin — SIK MI Miftahul Ulum 01",
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/admin/dashboard");
  }
  return <LoginForm />;
}

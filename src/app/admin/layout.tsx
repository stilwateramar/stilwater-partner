import { redirect } from "next/navigation";
import { getPartnerUser } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getPartnerUser();
  if (!user) redirect("/login");
  if (user.role !== "stilwater_admin") redirect("/partner");
  return <>{children}</>;
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { getPartnerUser, canManageTeam } from "@/lib/auth";
import { readDB } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getPartnerUser();
  if (!user) redirect("/login");

  const db = readDB();
  const provider = user.providerId
    ? db.providers.find((p) => p.id === user.providerId)
    : null;

  const isManager = canManageTeam(user);
  const isDoctor = user.role === "doctor";

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-6">
      <aside className="card p-4 h-max md:sticky md:top-20">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          {provider ? (
            <span
              className="h-8 w-8 rounded-lg"
              style={{ background: provider.color }}
            />
          ) : (
            <span className="h-8 w-8 rounded-lg bg-slate-800" />
          )}
          <div>
            <div className="text-sm font-semibold">
              {provider?.name ?? "Stilwater"}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              {user.role.replace("_", " ")}
            </div>
          </div>
        </div>
        <nav className="mt-3 flex md:flex-col gap-1 text-sm flex-wrap">
          <NavItem href="/partner" label="Overview" />
          <NavItem href="/partner/leads" label="Leads" />
          <NavItem href="/partner/calls" label="Call log" />
          <NavItem href="/partner/payments" label="Payments & invoices" />
          {isDoctor && (
            <NavItem href="/partner/doctor" label="Doctor queue" />
          )}
          {isManager && (
            <NavItem href="/partner/team" label="Team &amp; roles" />
          )}
        </nav>
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          Signed in as<br />
          <span className="text-slate-700 font-medium">{user.name}</span>
          <div>{user.email}</div>
          <div className="mt-2">
            <LogoutButton />
          </div>
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700"
    >
      {label}
    </Link>
  );
}

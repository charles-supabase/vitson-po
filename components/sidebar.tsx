"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import { MODULES } from "@/lib/modules";

export type PublicSession = {
  loginName: string;
  isSuperAdmin: boolean;
  modules: string[];
} | null;

function navClass(active: boolean) {
  return `mb-1 block rounded-sm px-3 py-2 text-sm transition-colors ${
    active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper hover:text-ink"
  }`;
}

export function Sidebar({ session }: { session: PublicSession }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  }

  const visibleModules = session
    ? MODULES.filter((m) => session.isSuperAdmin || session.modules.includes(m.key))
    : [];

  return (
    <aside className="flex h-screen w-56 flex-none flex-col border-r border-line bg-paper-raised">
      <div className="border-b border-line px-5 py-5">
        <p className="ledger-label">Vitson</p>
        <p className="font-display text-base font-semibold text-ink">Purchase Order</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <Link href="/" className={navClass(pathname === "/")}>
          Dashboard
        </Link>
        {visibleModules.map((m) => (
          <Link key={m.key} href={m.href} className={navClass(isActive(m.href))}>
            {m.label}
          </Link>
        ))}
        {session?.isSuperAdmin && (
          <Link href="/admin" className={navClass(isActive("/admin"))}>
            Administration
          </Link>
        )}
      </nav>

      <div className="border-t border-line px-5 py-4 text-sm">
        {session ? (
          <>
            <p className="text-ink">{session.loginName}</p>
            <form action={logout} className="mt-1">
              <button type="submit" className="text-xs text-ink-soft underline hover:text-ink">
                sign out
              </button>
            </form>
          </>
        ) : (
          <p className="text-ink-soft">Not signed in</p>
        )}
      </div>
    </aside>
  );
}

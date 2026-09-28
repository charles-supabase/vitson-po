import { requireModule } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function Page() {
  const session = await requireModule("voucher");

  return (
    <AppShell title="Voucher" session={{ loginName: session.loginName, isSuperAdmin: session.isSuperAdmin, modules: session.modules }}>
      <p className="text-sm text-ink-soft">
        The Voucher screens will be built in the next phase. You are signed in with access to
        this module.
      </p>
    </AppShell>
  );
}

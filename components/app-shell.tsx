import { Sidebar, type PublicSession } from "./sidebar";

export function AppShell({
  session,
  title,
  children,
}: {
  session: PublicSession;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar session={session} />
      <div className="flex-1">
        {title && (
          <header className="border-b border-line bg-paper-raised px-8 py-4">
            <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
          </header>
        )}
        <main className="px-8 py-8">{children}</main>
      </div>
    </div>
  );
}

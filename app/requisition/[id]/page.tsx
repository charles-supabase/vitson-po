import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AppShell } from "@/components/app-shell";
import { RequisitionDecisionButtons } from "@/components/requisition-decision-buttons";

export const dynamic = "force-dynamic";

export default async function RequisitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireModule("requisition");
  const { id } = await params;
  const requisitionId = Number(id);
  if (!requisitionId) notFound();

  const [{ data: header, error: headerError }, { data: details, error: detailsError }] =
    await Promise.all([
      supabaseAdmin
        .from("tbl_Requisition")
        .select(
          "id, request_no, dt_request, remark, bool_petty_cash, status, approved_at, tbl_Project_ID(project_name), tbl_Acc_Book(Book_Name), created_by_user:tbl_User!tbl_Requisition_created_by_fkey(user_login_name), approved_by_user:tbl_User!tbl_Requisition_approved_by_fkey(user_login_name)"
        )
        .eq("id", requisitionId)
        .maybeSingle(),
      supabaseAdmin
        .from("tbl_Requisition_Details")
        .select(
          "id, qty, on_Hand, bool_rush, remarks, tbl_Item(item_name), tbl_Unit(unit_name), tbl_Supplier(Supplier_Name), tbl_Item_packaging(packaging_name)"
        )
        .eq("request_id", requisitionId),
    ]);

  if (headerError || !header) notFound();

  return (
    <AppShell
      title={`Requisition #${header.request_no}`}
      session={{ loginName: session.loginName, isSuperAdmin: session.isSuperAdmin, modules: session.modules }}
    >
      <div className="mb-8 rounded border border-line bg-paper-raised p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="ledger-label">Date</p>
            <p className="text-sm text-ink">{header.dt_request}</p>
          </div>
          <div>
            <p className="ledger-label">Project</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <p className="text-sm text-ink">{(header as any).tbl_Project_ID?.project_name ?? "\u2014"}</p>
          </div>
          <div>
            <p className="ledger-label">Account book</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <p className="text-sm text-ink">{(header as any).tbl_Acc_Book?.Book_Name ?? "\u2014"}</p>
          </div>
          <div>
            <p className="ledger-label">Petty cash</p>
            <p className="text-sm text-ink">{header.bool_petty_cash ? "yes" : "no"}</p>
          </div>
          <div>
            <p className="ledger-label">Requested by</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <p className="text-sm text-ink">{(header as any).created_by_user?.user_login_name ?? "\u2014"}</p>
          </div>
          <div>
            <p className="ledger-label">Status</p>
            <p className="text-sm text-ink">{header.status}</p>
          </div>
          {header.status !== "PENDING" && (
            <div>
              <p className="ledger-label">Decided by</p>
              <p className="text-sm text-ink">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(header as any).approved_by_user?.user_login_name ?? "\u2014"}
              </p>
            </div>
          )}
          {header.remark && (
            <div className="col-span-2 sm:col-span-4">
              <p className="ledger-label">Remark</p>
              <p className="text-sm text-ink">{header.remark}</p>
            </div>
          )}
        </div>

        {header.status === "PENDING" && (
          <div className="mt-6 border-t border-line pt-4">
            <RequisitionDecisionButtons requisitionId={header.id} />
          </div>
        )}
      </div>

      <h2 className="mb-4 font-display text-lg font-semibold text-ink">Items</h2>
      {detailsError ? (
        <p className="text-sm text-danger">Could not load items: {detailsError.message}</p>
      ) : !details || details.length === 0 ? (
        <p className="text-sm text-ink-soft">No items on this requisition.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-line bg-paper-raised">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left ledger-label">
                <th className="px-4 py-2 font-normal">Item</th>
                <th className="px-4 py-2 font-normal">Unit</th>
                <th className="px-4 py-2 font-normal">On hand</th>
                <th className="px-4 py-2 font-normal">Qty</th>
                <th className="px-4 py-2 font-normal">Supplier</th>
                <th className="px-4 py-2 font-normal">Packaging</th>
                <th className="px-4 py-2 font-normal">Rush</th>
                <th className="px-4 py-2 font-normal">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(details as any[]).map((d) => (
                <tr key={d.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2 font-medium text-ink">{d.tbl_Item?.item_name ?? "\u2014"}</td>
                  <td className="px-4 py-2 text-ink-soft">{d.tbl_Unit?.unit_name ?? "\u2014"}</td>
                  <td className="px-4 py-2 font-mono text-ink-soft">{d.on_Hand ?? "\u2014"}</td>
                  <td className="px-4 py-2 font-mono text-ink-soft">{d.qty}</td>
                  <td className="px-4 py-2 text-ink-soft">{d.tbl_Supplier?.Supplier_Name ?? "\u2014"}</td>
                  <td className="px-4 py-2 text-ink-soft">
                    {d.tbl_Item_packaging?.packaging_name ?? "\u2014"}
                  </td>
                  <td className="px-4 py-2 text-ink-soft">{d.bool_rush ? "yes" : "no"}</td>
                  <td className="px-4 py-2 text-ink-soft">{d.remarks ?? "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

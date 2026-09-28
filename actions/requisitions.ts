"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireModule } from "@/lib/auth";

export type RequisitionDetailInput = {
  itemId: number;
  unitId: number;
  onHand: number | null;
  qty: number;
  supplierId: number | null;
  boolRush: boolean;
  remarks: string;
  itemPackaging: number | null;
  price: number | null;
};

export type RequisitionHeaderInput = {
  dtRequest: string; // yyyy-mm-dd
  accBookId: number;
  remark: string;
  projectId: number | null;
  boolPettyCash: boolean;
};

export type CreateRequisitionResult = { error?: string; id?: number; requestNo?: number };

export async function createRequisition(
  header: RequisitionHeaderInput,
  details: RequisitionDetailInput[]
): Promise<CreateRequisitionResult> {
  const session = await requireModule("requisition");

  if (!header.dtRequest) return { error: "Request date is required." };
  if (!header.accBookId) return { error: "Account book is required." };
  if (!details || details.length === 0) return { error: "Add at least one item line." };
  for (const d of details) {
    if (!d.itemId || !d.unitId || !d.qty || d.qty <= 0) {
      return { error: "Every line needs an item, a unit, and a quantity greater than zero." };
    }
  }

  const { data, error } = await supabaseAdmin.rpc("create_requisition", {
    p_dt_request: header.dtRequest,
    p_acc_book_id: header.accBookId,
    p_remark: header.remark || null,
    p_project_id: header.projectId,
    p_bool_petty_cash: header.boolPettyCash,
    p_created_by: session.userId,
    p_details: details.map((d) => ({
      item_id: d.itemId,
      unit_id: d.unitId,
      on_hand: d.onHand ?? "",
      qty: d.qty,
      supplier_id: d.supplierId ?? "",
      bool_rush: d.boolRush,
      remarks: d.remarks || "",
      item_packaging: d.itemPackaging ?? "",
      price: d.price ?? "",
    })),
  });

  if (error || !data || data.length === 0) {
    return { error: `Could not save requisition: ${error?.message ?? "unknown error"}` };
  }

  revalidatePath("/requisition");
  return { id: data[0].id, requestNo: data[0].request_no };
}

export async function decideRequisition(
  requisitionId: number,
  decision: "APPROVED" | "REJECTED"
): Promise<{ error?: string }> {
  const session = await requireModule("requisition");

  const { error } = await supabaseAdmin
    .from("tbl_Requisition")
    .update({
      status: decision,
      approved_by: session.userId,
      approved_at: new Date().toISOString(),
    })
    .eq("id", requisitionId)
    .eq("status", "PENDING"); // only a still-pending requisition can be decided

  if (error) return { error: error.message };

  revalidatePath("/requisition");
  revalidatePath(`/requisition/${requisitionId}`);
  return {};
}

export async function getItemOnHand(itemId: number): Promise<{ onHand: number }> {
  await requireModule("requisition");
  const { data, error } = await supabaseAdmin.rpc("get_item_on_hand", { p_item_id: itemId });
  if (error || data == null) return { onHand: 0 };
  return { onHand: data as number };
}

export async function getItemLastDefaults(
  itemId: number
): Promise<{ unitId: number | null; itemPackaging: number | null; price: number | null }> {
  await requireModule("requisition");
  const { data, error } = await supabaseAdmin.rpc("get_item_last_defaults", {
    p_item_id: itemId,
  });
  if (error || !data || data.length === 0) {
    return { unitId: null, itemPackaging: null, price: null };
  }
  return { unitId: data[0].unit_id, itemPackaging: data[0].item_packaging, price: data[0].price };
}

export async function getItemsByBound(
  boundId: number
): Promise<{ items: { id: number; item_name: string }[] }> {
  await requireModule("requisition");
  const { data, error } = await supabaseAdmin.rpc("get_items_by_bound", { p_bound_id: boundId });
  if (error) return { items: [] };
  return { items: (data ?? []) as { id: number; item_name: string }[] };
}

export type RequisitionListRow = {
  id: number;
  request_no: number;
  dt_request: string;
  status: string;
  project_name: string | null;
  supplier_names: string[];
};

export async function getRequisitionList(): Promise<RequisitionListRow[]> {
  await requireModule("requisition");

  const { data: headers } = await supabaseAdmin
    .from("tbl_Requisition")
    .select("id, request_no, dt_request, status, tbl_Project_ID(project_name)");

  const { data: detailRows } = await supabaseAdmin
    .from("tbl_Requisition_Details")
    .select("request_id, tbl_Supplier(Supplier_Name)");

  type DetailRow = {
    request_id: number;
    tbl_Supplier: { Supplier_Name: string } | { Supplier_Name: string }[] | null;
  };

  const suppliersByRequest = new Map<number, Set<string>>();
  for (const row of (detailRows ?? []) as unknown as DetailRow[]) {
    const supplier = Array.isArray(row.tbl_Supplier) ? row.tbl_Supplier[0] : row.tbl_Supplier;
    const name = supplier?.Supplier_Name;
    if (!name) continue;
    const set = suppliersByRequest.get(row.request_id) ?? new Set<string>();
    set.add(name);
    suppliersByRequest.set(row.request_id, set);
  }

  const STATUS_ORDER: Record<string, number> = { PENDING: 0, APPROVED: 1, REJECTED: 2 };

  const rows = ((headers ?? []) as any[]).map((h) => ({
    id: h.id,
    request_no: h.request_no,
    dt_request: h.dt_request,
    status: h.status,
    project_name: h.tbl_Project_ID?.project_name ?? null,
    supplier_names: Array.from(suppliersByRequest.get(h.id) ?? []),
  }));

  rows.sort((a, b) => {
    const statusDiff = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    if (statusDiff !== 0) return statusDiff;
    return b.dt_request.localeCompare(a.dt_request) || b.request_no - a.request_no;
  });

  return rows;
}

export type ItemHistoryRow = {
  po_date: string | null;
  supplier_name: string | null;
  po_no: number | null;
  quantity: number | null;
  price: number | null;
  discount: number | null;
  receiving_date: string | null;
  voucher_no: number | null;
};

export async function getItemHistory(
  itemId: number
): Promise<{ error?: string; history: ItemHistoryRow[] }> {
  await requireModule("requisition");

  const { data, error } = await supabaseAdmin.rpc("get_item_purchase_history", {
    p_item_id: itemId,
  });

  if (error) return { error: error.message, history: [] };
  return { history: (data ?? []) as ItemHistoryRow[] };
}

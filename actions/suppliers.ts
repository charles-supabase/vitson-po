"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireModule } from "@/lib/auth";

export type SupplierFormState = { error?: string; id?: number; name?: string };

function parseOptionalBigInt(
  raw: string,
  fieldLabel: string
): { value: number | null; error?: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null };
  if (!/^\d+$/.test(trimmed)) {
    return {
      value: null,
      error: `${fieldLabel} must be numbers only (no dashes or spaces) since it's stored as a number in the database.`,
    };
  }
  return { value: Number(trimmed) };
}

export async function createSupplier(
  _prev: SupplierFormState,
  formData: FormData
): Promise<SupplierFormState> {
  // Reachable both from Admin (super admins) and the Requisition quick-add flow.
  await requireModule("requisition");

  const supplierName = String(formData.get("supplierName") ?? "").trim();
  const contactPerson = String(formData.get("contactPerson") ?? "").trim() || null;
  const accBookId = String(formData.get("accBookId") ?? "").trim() || null;
  const accCategoryId = String(formData.get("accCategoryId") ?? "").trim() || null;

  if (!supplierName) {
    return { error: "Supplier name is required." };
  }

  const phone = parseOptionalBigInt(String(formData.get("phone") ?? ""), "Phone");
  if (phone.error) return { error: phone.error };

  const tin = parseOptionalBigInt(String(formData.get("supplierTin") ?? ""), "Supplier TIN");
  if (tin.error) return { error: tin.error };

  const { data: created, error } = await supabaseAdmin
    .from("tbl_Supplier")
    .insert({
      Supplier_Name: supplierName,
      Phone: phone.value,
      Contact_Person: contactPerson,
      Acc_Book_id: accBookId ? Number(accBookId) : null,
      Acc_Category_id: accCategoryId ? Number(accCategoryId) : null,
      supplier_TIN: tin.value,
    })
    .select("id, Supplier_Name")
    .single();

  if (error || !created) {
    return { error: `Could not save supplier: ${error?.message ?? "unknown error"}` };
  }

  revalidatePath("/admin/suppliers");
  return { id: created.id, name: created.Supplier_Name };
}

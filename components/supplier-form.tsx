"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createSupplier, type SupplierFormState } from "@/actions/suppliers";

const initialState: SupplierFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Saving\u2026" : "Add supplier"}
    </button>
  );
}

export function SupplierForm({
  accBooks,
  accCategories,
}: {
  accBooks: { id: number; label: string }[];
  accCategories: { id: number; label: string }[];
}) {
  const [state, formAction] = useActionState(createSupplier, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm text-ink-soft" htmlFor="supplierName">
          Supplier name
        </label>
        <input id="supplierName" name="supplierName" className="field-input" required />
      </div>
      <div>
        <label className="mb-1 block text-sm text-ink-soft" htmlFor="contactPerson">
          Contact person
        </label>
        <input id="contactPerson" name="contactPerson" className="field-input" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-ink-soft" htmlFor="phone">
          Phone
        </label>
        <input id="phone" name="phone" inputMode="numeric" className="field-input" placeholder="numbers only" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-ink-soft" htmlFor="supplierTin">
          Supplier TIN
        </label>
        <input id="supplierTin" name="supplierTin" inputMode="numeric" className="field-input" placeholder="numbers only" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-ink-soft" htmlFor="accBookId">
          Account book
        </label>
        <select id="accBookId" name="accBookId" className="field-input">
          <option value="">\u2014</option>
          {accBooks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-ink-soft" htmlFor="accCategoryId">
          Account category
        </label>
        <select id="accCategoryId" name="accCategoryId" className="field-input">
          <option value="">\u2014</option>
          {accCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger sm:col-span-2" role="alert">
          {state.error}
        </p>
      )}

      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}

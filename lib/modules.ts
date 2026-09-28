export type ModuleKey =
  | "requisition"
  | "purchase_order"
  | "receiving"
  | "voucher"
  | "bank";

export const MODULES: { key: ModuleKey; label: string; href: string; description: string }[] = [
  {
    key: "requisition",
    label: "Requisition",
    href: "/requisition",
    description: "Raise and approve requests for items",
  },
  {
    key: "purchase_order",
    label: "Purchase Order",
    href: "/purchase-order",
    description: "Create POs from approved requisitions, track deliveries",
  },
  {
    key: "receiving",
    label: "Receiving",
    href: "/receiving",
    description: "Log supplier deliveries and plant receiving",
  },
  {
    key: "voucher",
    label: "Voucher",
    href: "/voucher",
    description: "Build payment vouchers from received items",
  },
  {
    key: "bank",
    label: "Bank",
    href: "/bank",
    description: "Checks, DM memos, and bank balances",
  },
];

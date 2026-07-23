import type { WidgetTypeChoice } from "../builder/types";
import {
  BuildingIcon,
  CreditCardIcon,
  DropletIcon,
  GlobeIcon,
  ShieldIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
} from "./sidebarIcons";

export type DemoCategory = "Cash Flow" | "Transactions" | "Revenue" | "Risk & Compliance";

export interface CreativeDemoIdea {
  id: string;
  title: string;
  description: string;
  category: DemoCategory;
  badge: string;
  icon: () => JSX.Element;
  prompt: string;
  widgetType: WidgetTypeChoice;
}

// Each idea maps to one of our existing mock datasets via prompt+widgetType
// (deriveDataset resolves it) — not a distinct dataset per idea, so a few
// ideas intentionally share underlying content.
export const CREATIVE_DEMO_IDEAS: CreativeDemoIdea[] = [
  {
    id: "p_swift_wires",
    title: "High-Value Wire Alerts",
    description: "Monitor real-time SWIFT & FedWire transfers exceeding $50k with sanction review status.",
    category: "Risk & Compliance",
    badge: "Risk & Compliance",
    icon: ZapIcon,
    prompt: "Show recent transactions",
    widgetType: "grid",
  },
  {
    id: "p_mrr_breakdown",
    title: "MRR & SaaS Plan Revenue",
    description: "Compare core platform API, enterprise add-ons, and mobile suite monthly revenues against budget.",
    category: "Revenue",
    badge: "Financial Performance",
    icon: TrendingUpIcon,
    prompt: "Show monthly revenue by product",
    widgetType: "grid",
  },
  {
    id: "p_aml_risk",
    title: "Suspicious AML Queue",
    description: "Audit trail for anti-money laundering risk flags, velocity breaches, and sanctions list matches.",
    category: "Risk & Compliance",
    badge: "Audit & Security",
    icon: ShieldIcon,
    prompt: "Show recent transactions",
    widgetType: "grid",
  },
  {
    id: "p_treasury_fx",
    title: "Treasury & Forex Reserves",
    description: "Multi-currency reserves breakdown across major currencies with hedging risk status.",
    category: "Cash Flow",
    badge: "Treasury",
    icon: GlobeIcon,
    prompt: "Show book allocation by asset class",
    widgetType: "donut",
  },
  {
    id: "p_loan_pipeline",
    title: "Commercial Loan Pipeline",
    description: "Track commercial credit applications from underwriting to final disbursement.",
    category: "Transactions",
    badge: "Credit Operations",
    icon: BuildingIcon,
    prompt: "Show recent client deals",
    widgetType: "grid",
  },
  {
    id: "p_interchange_fees",
    title: "Card Interchange & Fees",
    description: "Track processing margins, net interchange fees, and merchant chargebacks by card network.",
    category: "Cash Flow",
    badge: "Payments",
    icon: CreditCardIcon,
    prompt: "Show realized gain",
    widgetType: "metric",
  },
  {
    id: "p_liquidity_burn",
    title: "Daily Liquidity & Run Rate",
    description: "Net cash inflows vs outflows and working capital ratio for treasury operations.",
    category: "Cash Flow",
    badge: "Liquidity",
    icon: DropletIcon,
    prompt: "Show realized gain",
    widgetType: "chart",
  },
  {
    id: "p_active_depositors",
    title: "High-Net-Worth Depositors",
    description: "New private banking customer acquisitions and institutional deposit growth.",
    category: "Transactions",
    badge: "Growth",
    icon: UsersIcon,
    prompt: "Show active clients",
    widgetType: "chart",
  },
];

export const DEMO_CATEGORIES: DemoCategory[] = ["Cash Flow", "Transactions", "Revenue", "Risk & Compliance"];

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "data.db"));

db.pragma("foreign_keys = ON");

db.exec(`
  DROP TABLE IF EXISTS deals;
  DROP TABLE IF EXISTS clients;
  DROP TABLE IF EXISTS bankers;

  CREATE TABLE bankers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    coverage_team TEXT NOT NULL
  );

  CREATE TABLE clients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    country TEXT NOT NULL
  );

  CREATE TABLE deals (
    id INTEGER PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    lead_banker_id INTEGER NOT NULL REFERENCES bankers(id),
    deal_type TEXT NOT NULL,
    deal_value REAL NOT NULL,
    fee REAL NOT NULL,
    stage TEXT NOT NULL,
    created_date TEXT NOT NULL,
    close_date TEXT
  );
`);

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function pick<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)]!;
}

function pickWeighted<T>(items: readonly { value: T; weight: number }[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item.value;
  }
  return items[items.length - 1]!.value;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const now = new Date();

const bankerNames = [
  "Alex Whitfield",
  "Priya Nair",
  "Marco Bellandi",
  "Sofia Kowalski",
  "James Okafor",
  "Lena Fischer",
  "Ravi Chandran",
  "Isabelle Moreau",
];
const coverageTeams = ["TMT", "Healthcare", "FIG", "Energy"] as const;

const insertBanker = db.prepare("INSERT INTO bankers (id, name, coverage_team) VALUES (?, ?, ?)");
bankerNames.forEach((name, i) => {
  insertBanker.run(i + 1, name, pick(coverageTeams));
});
const bankerCount = bankerNames.length;

const clientNames = [
  "Northgate Industries",
  "Vantage Biopharm",
  "Solara Energy Partners",
  "Fenwick Retail Group",
  "Ashford Capital Holdings",
  "Meridian Logistics",
  "Copperline Media",
  "Brightfield Materials",
  "Harborview Insurance",
  "Delta Robotics",
  "Ironwood Foods",
  "Silverlake Networks",
  "Cobalt Aerospace",
  "Riverton Chemicals",
  "Palisade Financial",
  "Quantum Semiconductors",
  "Cedar Grove Hospitality",
  "Windham Utilities",
  "Blackstone Timber",
  "Aurelia Pharmaceuticals",
];
const sectors = ["Technology", "Healthcare", "Energy", "Financial Services", "Industrials", "Consumer"];
const countries = ["United States", "United Kingdom", "Germany", "Singapore", "Canada", "France"];

const insertClient = db.prepare("INSERT INTO clients (id, name, sector, country) VALUES (?, ?, ?, ?)");
clientNames.forEach((name, i) => {
  insertClient.run(i + 1, name, pick(sectors), pick(countries));
});
const clientCount = clientNames.length;

const dealTypes = ["M&A", "IPO", "bond", "loan"] as const;
const stages = [
  { value: "prospecting", weight: 15 },
  { value: "mandate", weight: 15 },
  { value: "due_diligence", weight: 15 },
  { value: "signed", weight: 15 },
  { value: "closed", weight: 35 },
  { value: "dead", weight: 5 },
] as const;

// month offsets for closed deals: 0 = current month (heaviest), going back 5 months
const monthOffsetWeights = [
  { value: 0, weight: 3 },
  { value: -1, weight: 2 },
  { value: -2, weight: 1 },
  { value: -3, weight: 1 },
  { value: -4, weight: 1 },
  { value: -5, weight: 1 },
];

function randomCloseDate(): Date {
  const offset = pickWeighted(monthOffsetWeights);
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const daysInMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  const maxDay = offset === 0 ? now.getDate() : daysInMonth;
  const day = randomInt(1, Math.max(1, maxDay));
  return new Date(target.getFullYear(), target.getMonth(), day);
}

const insertDeal = db.prepare(`
  INSERT INTO deals (id, client_id, lead_banker_id, deal_type, deal_value, fee, stage, created_date, close_date)
  VALUES (@id, @clientId, @leadBankerId, @dealType, @dealValue, @fee, @stage, @createdDate, @closeDate)
`);

const dealCount = 120;
for (let i = 1; i <= dealCount; i++) {
  const stage = pickWeighted(stages);
  const dealValue = randomFloat(50_000_000, 5_000_000_000);
  const fee = dealValue * randomFloat(0.005, 0.02);

  let closeDate: Date | null = null;
  let createdDate: Date;

  if (stage === "closed") {
    closeDate = randomCloseDate();
    createdDate = addDays(closeDate, -randomInt(10, 90));
  } else {
    createdDate = addDays(now, -randomInt(1, 180));
  }

  insertDeal.run({
    id: i,
    clientId: randomInt(1, clientCount),
    leadBankerId: randomInt(1, bankerCount),
    dealType: pick(dealTypes),
    dealValue,
    fee,
    stage,
    createdDate: toIsoDate(createdDate),
    closeDate: closeDate ? toIsoDate(closeDate) : null,
  });
}

db.close();

console.log(`Seeded ${bankerCount} bankers, ${clientCount} clients, ${dealCount} deals.`);

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { SchemaInfo } from "../shared";

const FORBIDDEN_KEYWORDS = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|ATTACH|PRAGMA|REPLACE|VACUUM)\b/i;

export function assertSingleSelect(sql: string): void {
  let trimmed = sql.trim();
  if (trimmed.endsWith(";")) {
    trimmed = trimmed.slice(0, -1).trim();
  }
  if (trimmed.includes(";")) {
    throw new Error("only a single statement is allowed");
  }
  if (!/^(SELECT|WITH)\b/i.test(trimmed)) {
    throw new Error("only a SELECT statement is allowed");
  }
  if (FORBIDDEN_KEYWORDS.test(trimmed)) {
    throw new Error("statement contains a disallowed keyword");
  }
}

function renderSchema(schema: SchemaInfo): string {
  return schema.tables
    .map((table) => {
      const columns = table.columns.map((c) => `${c.name} ${c.type}`).join(", ");
      const fks = table.foreignKeys
        .map((fk) => `FOREIGN KEY (${fk.column}) REFERENCES ${fk.referencesTable}(${fk.referencesColumn})`)
        .join(", ");
      return `TABLE ${table.name} (${columns}${fks ? `, ${fks}` : ""})`;
    })
    .join("\n");
}

function stripMarkdownFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:sql)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
}

function buildPrompt(schema: SchemaInfo, userPrompt: string, rejectionReason?: string): string {
  const base = `You generate SQL for a ${schema.dialect} database with the following schema:

${renderSchema(schema)}

Task: ${userPrompt}

Rules:
- Return exactly one SELECT statement (a WITH...SELECT is allowed).
- Use relative dates via SQLite-native expressions (e.g. date('now', 'start of month')), never hardcoded dates.
- Always include a LIMIT clause, no higher than 500.
- Output SQL text only — no comments, no markdown code fences, no explanation.`;

  if (rejectionReason) {
    return `${base}\n\nYour previous answer was rejected: ${rejectionReason}. Fix it and try again.`;
  }
  return base;
}

async function callModel(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: openai(process.env["OPENAI_MODEL"] ?? "gpt-4o"),
    prompt,
  });
  return stripMarkdownFences(text);
}

export async function generateSql(schema: SchemaInfo, userPrompt: string): Promise<string> {
  const first = await callModel(buildPrompt(schema, userPrompt));
  try {
    assertSingleSelect(first);
    return first;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    const second = await callModel(buildPrompt(schema, userPrompt, reason));
    assertSingleSelect(second);
    return second;
  }
}

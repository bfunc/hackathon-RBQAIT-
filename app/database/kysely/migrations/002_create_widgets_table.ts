import { sql, type Kysely } from "kysely";
import type { Database } from "../types";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("widgets")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("prompt", "text", (col) => col.notNull())
    .addColumn("connector_id", "text", (col) => col.notNull())
    .addColumn("sql", "text", (col) => col.notNull())
    .addColumn("created_at", "text", (col) => col.notNull().defaultTo(sql`current_timestamp`))
    .addColumn("on_demo", "boolean", (col) => col.notNull().defaultTo(0))
    .addColumn("demo_order", "integer")
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("widgets").execute();
}

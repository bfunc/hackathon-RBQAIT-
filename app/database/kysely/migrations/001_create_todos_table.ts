import type { Kysely } from "kysely";
import type { Database } from "../types";

export async function up(db: Kysely<Database>): Promise<void> {
  const withId = db.schema.createTable("todos").addColumn("id", "integer", (col) => col.primaryKey().autoIncrement());
  await withId.addColumn("text", "text", (col) => col.notNull()).execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("todos").execute();
}

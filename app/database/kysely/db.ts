import "../../server/load";
import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { Database } from "./types";

export function dbKysely() {
  const dialect = new SqliteDialect({
    database: new SQLite(process.env.DATABASE_URL),
  });
  return new Kysely<Database>({
    dialect,
  });
}

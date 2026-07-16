import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  widgets: WidgetTable;
}

export interface WidgetTable {
  id: Generated<number>;
  name: string;
  prompt: string;
  connector_id: string;
  sql: string;
  created_at: Generated<string>;
  /** SQLite has no boolean type; better-sqlite3 requires 0/1, not true/false. */
  on_demo: Generated<number>;
  demo_order: number | null;
}

export type Widget = Selectable<WidgetTable>;
export type NewWidget = Insertable<WidgetTable>;
export type WidgetUpdate = Updateable<WidgetTable>;

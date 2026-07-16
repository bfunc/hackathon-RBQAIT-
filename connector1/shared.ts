export interface SchemaInfo {
  dialect: string;
  tables: TableInfo[];
}

export interface TableInfo {
  name: string;
  columns: { name: string; type: string }[];
  foreignKeys: { column: string; referencesTable: string; referencesColumn: string }[];
}

export interface QueryRequest {
  sql: string;
}

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
}

import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export function DataGrid({ columns, rows }: { columns: string[]; rows: unknown[][] }) {
  const columnDefs: ColDef[] = columns.map((name) => ({ field: name, headerName: name, flex: 1 }));
  const rowData = rows.map((row) => Object.fromEntries(columns.map((name, i) => [name, row[i]])));

  return (
    <div style={{ width: "100%" }}>
      <AgGridReact
        theme={themeQuartz}
        columnDefs={columnDefs}
        rowData={rowData}
        domLayout="autoHeight"
        suppressHorizontalScroll
      />
    </div>
  );
}

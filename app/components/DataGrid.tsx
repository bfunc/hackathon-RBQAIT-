import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const gridTheme = themeQuartz.withParams({
  backgroundColor: "#12151d",
  foregroundColor: "#e7e9ee",
  headerBackgroundColor: "#191d27",
  headerTextColor: "#8b93a6",
  headerFontSize: 12,
  oddRowBackgroundColor: "#12151d",
  rowHoverColor: "rgba(76, 142, 255, 0.06)",
  borderColor: "#262b38",
  chromeBackgroundColor: "#191d27",
  fontFamily: "JetBrains Mono, ui-monospace, monospace",
  headerFontFamily: "Space Grotesk, sans-serif",
  accentColor: "#4c8eff",
  wrapperBorderRadius: 10,
});

export function DataGrid({ columns, rows }: { columns: string[]; rows: unknown[][] }) {
  const columnDefs: ColDef[] = columns.map((name) => ({ field: name, headerName: name, flex: 1 }));
  const rowData = rows.map((row) => Object.fromEntries(columns.map((name, i) => [name, row[i]])));

  return (
    <div style={{ width: "100%" }}>
      <AgGridReact
        theme={gridTheme}
        columnDefs={columnDefs}
        rowData={rowData}
        domLayout="autoHeight"
        suppressHorizontalScroll
      />
    </div>
  );
}

import { useState } from "react";
import { DashboardProvider } from "../state/DashboardContext";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { GridArea } from "./GridArea";
import { SettingsPage } from "./SettingsPage";

export function DashboardShell() {
  const [view, setView] = useState<"dashboard" | "settings">("dashboard");

  return (
    <DashboardProvider>
      <div className="app-shell">
        <Navbar
          view={view}
          onToggleView={() => setView((v) => (v === "dashboard" ? "settings" : "dashboard"))}
        />
        {view === "settings" ? (
          <SettingsPage />
        ) : (
          <div className="dashboard-shell">
            <Sidebar />
            <GridArea />
          </div>
        )}
      </div>
    </DashboardProvider>
  );
}

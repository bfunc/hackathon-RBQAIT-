import { useDashboardDispatch } from "../state/DashboardContext";
import { GENERAL_DEMO_SEED, TRADING_DESK_SEED, buildSeedState } from "../state/demoSeeds";
import { ThemeSwitch } from "./ThemeSwitch";

export function SettingsPage() {
  const dispatch = useDashboardDispatch();

  function handleCleanDemoPage() {
    dispatch({ type: "RESET_DASHBOARD" });
  }

  return (
    <div className="settings-page">
      <h2 className="settings-heading">Settings</h2>

      <section className="settings-section">
        <h3 className="settings-section-title">Theme</h3>
        <ThemeSwitch />
      </section>

      <section className="settings-section">
        <h3 className="settings-section-title">Demo data</h3>
        <div className="settings-actions">
          <button
            type="button"
            className="settings-button"
            onClick={() => dispatch({ type: "SEED_WIDGETS", ...buildSeedState(GENERAL_DEMO_SEED) })}
          >
            Generate random widgets
          </button>
          <button
            type="button"
            className="settings-button"
            onClick={() => dispatch({ type: "SEED_WIDGETS", ...buildSeedState(TRADING_DESK_SEED) })}
          >
            Generate trading desk demo
          </button>
          <button
            type="button"
            className="settings-button settings-button-danger"
            onClick={handleCleanDemoPage}
          >
            Clean demo page
          </button>
        </div>
      </section>
    </div>
  );
}

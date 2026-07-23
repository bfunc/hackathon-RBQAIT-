import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { DashboardState } from "../types";
import { dashboardReducer, type DashboardAction } from "./dashboardReducer";
import { TRADING_DESK_SEED, buildSeedState } from "./demoSeeds";

const STORAGE_KEY = "liquid-grid-dashboard-state";

const defaultState: DashboardState = {
  widgets: {},
  tiles: {},
  layout: [],
  sidebar: { collapsed: false, width: 340 },
};

// First-ever visit (nothing in localStorage yet) seeds the trading-desk
// demo instead of an empty grid, so a new user never lands on a blank page.
function emptyStateWithDemoSeed(): DashboardState {
  return { ...defaultState, ...buildSeedState(TRADING_DESK_SEED) };
}

function loadInitialState(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStateWithDemoSeed();
    const parsed = JSON.parse(raw);
    // Minimal shape guard — malformed/outdated saved state falls back to
    // default rather than crashing the app on load.
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.widgets &&
      parsed.tiles &&
      parsed.layout
    ) {
      return { ...defaultState, ...parsed };
    }
    return emptyStateWithDemoSeed();
  } catch {
    return emptyStateWithDemoSeed();
  }
}

const StateContext = createContext<DashboardState | null>(null);
const DispatchContext = createContext<Dispatch<DashboardAction> | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    dashboardReducer,
    undefined,
    loadInitialState,
  );

  // Full auto-save: any dashboard change (drop, drag, resize, remove,
  // widget update, sidebar toggle) persists here, and reloading the page
  // restores it via loadInitialState above.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full/unavailable — persistence is a nice-to-have, not
      // something that should ever break the live dashboard.
    }
  }, [state]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useDashboardState(): DashboardState {
  const ctx = useContext(StateContext);
  if (!ctx)
    throw new Error("useDashboardState must be used within DashboardProvider");
  return ctx;
}

export function useDashboardDispatch(): Dispatch<DashboardAction> {
  const ctx = useContext(DispatchContext);
  if (!ctx)
    throw new Error(
      "useDashboardDispatch must be used within DashboardProvider",
    );
  return ctx;
}

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/static/LiquidGridLayout/",
  plugins: [react()],
  define: {
    // react-grid-layout's bundled react-draggable reads process.env.NODE_ENV
    // for a debug-log gate; the browser has no `process`, so without this it
    // throws on every drag mousedown and the drag never starts.
    "process.env.NODE_ENV": JSON.stringify("development"),
  },
});

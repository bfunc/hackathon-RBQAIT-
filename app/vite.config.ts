import vike from "vike/plugin";
import { defineConfig } from "vite";
import { inputPlugin } from "./vite-plugin-input.js";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [vike(), inputPlugin({ name: "migrate", entry: "database/kysely/migrate.ts" }), react()],
});

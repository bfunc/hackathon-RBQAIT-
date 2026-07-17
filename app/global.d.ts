import type { dbKysely } from "./database/kysely/db";

declare global {
  namespace Vike {
    interface PageContextServer {
      db: ReturnType<typeof dbKysely>;
    }
    interface Config {
      fullWidth?: boolean;
    }
  }
}

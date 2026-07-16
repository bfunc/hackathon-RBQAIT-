// https://vike.dev/data

import * as kyselyQueries from "../../database/kysely/queries/todos";
import type { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(_pageContext: PageContextServer) {
  const todoItemsInitial = await kyselyQueries.getAllTodos(_pageContext.db);

  return { todoItemsInitial };
}

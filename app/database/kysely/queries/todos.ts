import type { dbKysely } from "../db";

export async function insertTodo(db: ReturnType<typeof dbKysely>, text: string) {
  return await db.insertInto("todos").values({ text }).returningAll().executeTakeFirstOrThrow();
}

export async function getAllTodos(db: ReturnType<typeof dbKysely>) {
  return await db.selectFrom("todos").selectAll().execute();
}

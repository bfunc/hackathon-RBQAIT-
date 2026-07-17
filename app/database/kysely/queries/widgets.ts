import type { dbKysely } from "../db";
import type { NewWidget } from "../types";

export async function insertWidget(db: ReturnType<typeof dbKysely>, widget: NewWidget) {
  return await db.insertInto("widgets").values(widget).returningAll().executeTakeFirstOrThrow();
}

export async function listWidgets(db: ReturnType<typeof dbKysely>) {
  return await db.selectFrom("widgets").selectAll().orderBy("id", "desc").execute();
}

export async function getWidgetById(db: ReturnType<typeof dbKysely>, id: number) {
  return await db.selectFrom("widgets").selectAll().where("id", "=", id).executeTakeFirst();
}

export async function cloneWidget(db: ReturnType<typeof dbKysely>, id: number) {
  const source = await getWidgetById(db, id);
  if (!source) {
    throw new Error(`widget ${id} not found`);
  }
  return await insertWidget(db, {
    name: `${source.name} (copy)`,
    prompt: source.prompt,
    connector_id: source.connector_id,
    sql: source.sql,
    on_demo: 0,
    demo_order: null,
  });
}

export async function setWidgetDemo(db: ReturnType<typeof dbKysely>, id: number, onDemo: boolean) {
  if (onDemo) {
    const { maxOrder } = await db
      .selectFrom("widgets")
      .select((eb) => eb.fn.max("demo_order").as("maxOrder"))
      .executeTakeFirstOrThrow();
    await db
      .updateTable("widgets")
      .set({ on_demo: 1, demo_order: (maxOrder ?? 0) + 1 })
      .where("id", "=", id)
      .execute();
  } else {
    await db.updateTable("widgets").set({ on_demo: 0, demo_order: null }).where("id", "=", id).execute();
  }
  return await getWidgetById(db, id);
}

export async function deleteWidget(db: ReturnType<typeof dbKysely>, id: number) {
  await db.deleteFrom("widgets").where("id", "=", id).execute();
}

export async function listDemoWidgets(db: ReturnType<typeof dbKysely>) {
  return await db
    .selectFrom("widgets")
    .selectAll()
    .where("on_demo", "=", 1)
    .orderBy("demo_order", "asc")
    .execute();
}

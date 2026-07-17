import type { dbKysely } from "../database/kysely/db";
import * as widgetQueries from "../database/kysely/queries/widgets";
import { getConnector } from "../server/connectors";
import { assertSingleSelect, generateSql } from "../server/generate-sql";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<{ db: ReturnType<typeof dbKysely> }>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  getConnectorSchema: publicProcedure
    .input(z.object({ connectorId: z.string() }))
    .query(async ({ input }) => {
      return await getConnector(input.connectorId).getSchema();
    }),

  generateWidget: publicProcedure
    .input(z.object({ prompt: z.string(), connectorId: z.string() }))
    .mutation(async ({ input }) => {
      const connector = getConnector(input.connectorId);
      const schema = await connector.getSchema();
      const sql = await generateSql(schema, input.prompt);
      const { columns, rows } = await connector.execute(sql);
      return { sql, columns, rows };
    }),

  saveWidget: publicProcedure
    .input(
      z.object({
        name: z.string(),
        prompt: z.string(),
        connectorId: z.string(),
        sql: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      assertSingleSelect(input.sql);
      const widget = await widgetQueries.insertWidget(ctx.db, {
        name: input.name,
        prompt: input.prompt,
        connector_id: input.connectorId,
        sql: input.sql,
        on_demo: 0,
        demo_order: null,
      });
      return await widgetQueries.setWidgetDemo(ctx.db, widget.id, true);
    }),

  listWidgets: publicProcedure.query(async ({ ctx }) => {
    return await widgetQueries.listWidgets(ctx.db);
  }),

  cloneWidget: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await widgetQueries.cloneWidget(ctx.db, input.id);
    }),

  setWidgetDemo: publicProcedure
    .input(z.object({ id: z.number(), onDemo: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return await widgetQueries.setWidgetDemo(ctx.db, input.id, input.onDemo);
    }),

  deleteWidget: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await widgetQueries.deleteWidget(ctx.db, input.id);
    }),

  listDemoWidgets: publicProcedure.query(async ({ ctx }) => {
    return await widgetQueries.listDemoWidgets(ctx.db);
  }),

  getWidgetData: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const widget = await widgetQueries.getWidgetById(ctx.db, input.id);
      if (!widget) {
        throw new Error(`widget ${input.id} not found`);
      }
      const connector = getConnector(widget.connector_id);
      try {
        const { columns, rows } = await connector.execute(widget.sql);
        return { widget, columns, rows };
      } catch (err) {
        return { widget, error: err instanceof Error ? err.message : String(err) };
      }
    }),
});

export type AppRouter = typeof appRouter;

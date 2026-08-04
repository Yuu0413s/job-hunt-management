import { Hono } from "hono";

export type Bindings = Record<string, never>;

const app = new Hono<{ Bindings: Bindings }>();

app.get("/api/health", (c) => {
	return c.json({ status: "ok" });
});

export default app;

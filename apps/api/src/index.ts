import { neon } from "@neondatabase/serverless";
import { Hono } from "hono";

export type Bindings = {
	DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

export function redactConnectionString(error: unknown): string {
	const message = error instanceof Error ? error.message : String(error);
	return message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[REDACTED]");
}

app.get("/api/health", (c) => {
	return c.json({ status: "ok" });
});

app.get("/api/health/db", async (c) => {
	try {
		const sql = neon(c.env.DATABASE_URL);
		await sql`SELECT 1`;
		return c.json({ status: "ok" });
	} catch (error) {
		console.error("DB health check failed:", redactConnectionString(error));
		return c.json({ status: "error" }, 500);
	}
});

export default app;

import { describe, expect, test } from "bun:test";
import app from "./index";

describe("GET /api/health", () => {
	test('200 と { status: "ok" } を返す', async () => {
		const res = await app.request("/api/health");

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok" });
	});
});

describe("未定義のルート", () => {
	test("404 を返す", async () => {
		const res = await app.request("/api/not-found");

		expect(res.status).toBe(404);
	});
});

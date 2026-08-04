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

describe("GET /api/health/db", () => {
	test('DATABASE_URL が不正な形式の場合、500 と { status: "error" } を返す', async () => {
		const res = await app.request(
			"/api/health/db",
			{},
			{ DATABASE_URL: "not-a-valid-connection-string" },
		);

		expect(res.status).toBe(500);
		expect(await res.json()).toEqual({ status: "error" });
	});

	test('DATABASE_URL が空文字の場合、500 と { status: "error" } を返す', async () => {
		const res = await app.request("/api/health/db", {}, { DATABASE_URL: "" });

		expect(res.status).toBe(500);
		expect(await res.json()).toEqual({ status: "error" });
	});
});

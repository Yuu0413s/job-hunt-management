import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import app, { redactConnectionString } from "./index";

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
	beforeEach(() => {
		spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		(console.error as unknown as { mockRestore: () => void }).mockRestore();
	});

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

describe("redactConnectionString", () => {
	test("メッセージに接続文字列が含まれる場合、マスクする", () => {
		const error = new Error(
			"Database connection string provided to `neon()` is not a valid URL. Connection string: postgresql://user:pass@host/db",
		);

		expect(redactConnectionString(error)).toBe(
			"Database connection string provided to `neon()` is not a valid URL. Connection string: [REDACTED]",
		);
	});

	test("メッセージに接続文字列が含まれない場合、そのまま返す", () => {
		const error = new Error("Server error (HTTP status 500): timeout");

		expect(redactConnectionString(error)).toBe(
			"Server error (HTTP status 500): timeout",
		);
	});

	test("Error インスタンスでない場合、文字列化してから返す", () => {
		expect(redactConnectionString("plain string error")).toBe(
			"plain string error",
		);
	});
});

import { expect, test } from "bun:test";

test("@job-hunt/shared のエントリポイントを読み込める", async () => {
	await expect(import("./index")).resolves.toBeDefined();
});

import { expect, test } from "bun:test";

test("@job-hunt/shared をパッケージ名で解決できる", async () => {
	await expect(import("@job-hunt/shared")).resolves.toBeDefined();
});

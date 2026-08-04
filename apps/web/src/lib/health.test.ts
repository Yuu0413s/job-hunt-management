import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { fetchHealth } from "./health";

function mockFetch(response: Response) {
	return spyOn(globalThis, "fetch").mockResolvedValue(response);
}

describe("fetchHealth", () => {
	afterEach(() => {
		(
			globalThis.fetch as unknown as { mockRestore?: () => void }
		).mockRestore?.();
	});

	test("正常系: 200 のとき { status: string } を返す", async () => {
		mockFetch(new Response(JSON.stringify({ status: "ok" }), { status: 200 }));

		const result = await fetchHealth();

		expect(result).toEqual({ status: "ok" });
	});

	test("異常系: 500 のとき例外を投げる", async () => {
		mockFetch(new Response(null, { status: 500 }));

		await expect(fetchHealth()).rejects.toThrow(
			"/api/health への通信に失敗しました (status: 500)",
		);
	});

	test("境界値: レスポンスボディが不正なJSONのとき例外を投げる", async () => {
		mockFetch(new Response("not-json", { status: 200 }));

		await expect(fetchHealth()).rejects.toThrow();
	});
});

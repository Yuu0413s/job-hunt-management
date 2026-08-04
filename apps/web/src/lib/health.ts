export type HealthResponse = {
	status: string;
};

function isHealthResponse(value: unknown): value is HealthResponse {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof (value as { status?: unknown }).status === "string"
	);
}

export async function fetchHealth(): Promise<HealthResponse> {
	const res = await fetch("/api/health");

	if (!res.ok) {
		throw new Error(
			`/api/health への通信に失敗しました (status: ${res.status})`,
		);
	}

	const body: unknown = await res.json();

	if (!isHealthResponse(body)) {
		throw new Error("/api/health のレスポンス形式が不正です");
	}

	return body;
}

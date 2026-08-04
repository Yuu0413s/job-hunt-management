export type HealthResponse = {
	status: string;
};

export async function fetchHealth(): Promise<HealthResponse> {
	const res = await fetch("/api/health");

	if (!res.ok) {
		throw new Error(
			`/api/health への通信に失敗しました (status: ${res.status})`,
		);
	}

	return res.json();
}

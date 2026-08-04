import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { fetchHealth } from "@/lib/health";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const { data, isPending, isError, error } = useQuery({
		queryKey: ["health"],
		queryFn: fetchHealth,
	});

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-2 p-4">
			<h1 className="font-heading text-2xl font-semibold">
				Job Hunt Management
			</h1>
			<p className="text-muted-foreground">
				API status: {isPending && "確認中..."}
				{isError && `エラー: ${error.message}`}
				{data?.status}
			</p>
		</main>
	);
}

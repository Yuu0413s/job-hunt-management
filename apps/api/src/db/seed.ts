import { config } from "dotenv";

// シードスクリプトは常に .dev.vars の値で実行したい。
// override を付けないと、シェルに残った別の DATABASE_URL（本番の値など）が
// 優先されてしまい、意図しない接続先に migrate/seed してしまう恐れがある。
config({ path: ".dev.vars", quiet: true, override: true });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL is required. Check apps/api/.dev.vars.");
}

const SEED_COMPANY_ID = "00000000-0000-0000-0000-000000000001";
const SEED_USER_ID = "seed-user";
const SEED_COMPANY_NAME = "動作確認用シード株式会社";

async function main(databaseUrl: string) {
	const sql = neon(databaseUrl);
	const db = drizzle(sql, { schema, casing: "snake_case" });

	// 存在確認とinsertを1つのSQL文にまとめることで、同時実行時に
	// 重複投入されるレース条件（TOCTOU）を避ける。
	const [inserted] = await db
		.insert(schema.companies)
		.values({
			id: SEED_COMPANY_ID,
			userId: SEED_USER_ID,
			name: SEED_COMPANY_NAME,
		})
		.onConflictDoNothing({ target: schema.companies.id })
		.returning();

	if (inserted) {
		console.log("シードデータを投入しました:", inserted);
	} else {
		console.log("シードデータは既に存在します:", SEED_COMPANY_ID);
	}
}

main(databaseUrl).catch((error) => {
	console.error("シードデータの投入に失敗しました:", error);
	process.exit(1);
});

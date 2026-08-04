import { config } from "dotenv";

config({ path: ".dev.vars", quiet: true });

import { neon } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL is required. Check apps/api/.dev.vars.");
}

const SEED_USER_ID = "seed-user";
const SEED_COMPANY_NAME = "動作確認用シード株式会社";

async function main(databaseUrl: string) {
	const sql = neon(databaseUrl);
	const db = drizzle(sql, { schema, casing: "snake_case" });

	const existing = await db
		.select({ id: schema.companies.id })
		.from(schema.companies)
		.where(
			and(
				eq(schema.companies.userId, SEED_USER_ID),
				eq(schema.companies.name, SEED_COMPANY_NAME),
			),
		)
		.limit(1);

	const [existingCompany] = existing;
	if (existingCompany) {
		console.log("シードデータは既に存在します:", existingCompany.id);
		return;
	}

	const [inserted] = await db
		.insert(schema.companies)
		.values({
			userId: SEED_USER_ID,
			name: SEED_COMPANY_NAME,
		})
		.returning();

	console.log("シードデータを投入しました:", inserted);
}

main(databaseUrl).catch((error) => {
	console.error("シードデータの投入に失敗しました:", error);
	process.exit(1);
});

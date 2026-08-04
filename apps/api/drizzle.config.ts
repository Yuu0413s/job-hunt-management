import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".dev.vars", quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL is required. Check apps/api/.dev.vars.");
}

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	// スキーマはcamelCaseで定義し、DB上はsnake_caseにする設定。
	// 実行時にdrizzle()でクライアントを作る際も同じcasingを指定しないと、
	// 生成されるSQLのカラム名がここで作ったテーブルと一致しなくなる。
	casing: "snake_case",
	dbCredentials: {
		url: databaseUrl,
	},
});

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// override を付けないと、シェルに残った別の DATABASE_URL（本番の値など）が
// 優先されてしまい、意図しない接続先に generate/migrate/studio してしまう恐れがある。
config({ path: ".dev.vars", quiet: true, override: true });

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

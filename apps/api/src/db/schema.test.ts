import { describe, expect, test } from "bun:test";
import type { AnyPgColumn, ForeignKey } from "drizzle-orm/pg-core";
import { getTableConfig } from "drizzle-orm/pg-core";
import {
	applicationStatusEnum,
	applications,
	applicationTypeEnum,
	closeReasonEnum,
	companies,
	documents,
	events,
	priorityEnum,
} from "./schema";

function findColumn(columns: AnyPgColumn[], name: string) {
	const column = columns.find((c) => c.name === name);
	if (!column) {
		throw new Error(`column "${name}" not found`);
	}
	return column;
}

function findForeignKeyTo(foreignKeys: ForeignKey[], foreignTable: unknown) {
	const fk = foreignKeys.find(
		(f) => f.reference().foreignTable === foreignTable,
	);
	if (!fk) {
		throw new Error("matching foreign key not found");
	}
	return fk;
}

describe("enum定義", () => {
	test("application_type は FULL_TIME / INTERNSHIP を持つ", () => {
		expect(applicationTypeEnum.enumValues).toEqual(["FULL_TIME", "INTERNSHIP"]);
	});

	test("application_status は 8つのステータスを持つ", () => {
		expect(applicationStatusEnum.enumValues).toEqual([
			"INTERESTED",
			"ES_WRITING",
			"APPLIED",
			"BRIEFING",
			"CASUAL",
			"INTERVIEW",
			"OFFER",
			"CLOSED",
		]);
	});

	test("close_reason は REJECTED / WITHDRAWN / UNKNOWN を持つ", () => {
		expect(closeReasonEnum.enumValues).toEqual([
			"REJECTED",
			"WITHDRAWN",
			"UNKNOWN",
		]);
	});

	test("priority は HIGH / MID / LOW を持つ", () => {
		expect(priorityEnum.enumValues).toEqual(["HIGH", "MID", "LOW"]);
	});
});

describe("全テーブル共通", () => {
	test.each([
		["companies", companies],
		["applications", applications],
		["events", events],
		["documents", documents],
	])("%s は userId (NOT NULL) を持つ", (_name, table) => {
		const { columns } = getTableConfig(table);
		const userId = findColumn(columns, "userId");

		expect(userId.notNull).toBe(true);
		expect(userId.dataType).toBe("string");
	});
});

describe("companies テーブル", () => {
	const { columns, uniqueConstraints } = getTableConfig(companies);

	test("name は NOT NULL", () => {
		expect(findColumn(columns, "name").notNull).toBe(true);
	});

	test("recruitUrl / homepageUrl / memo は NULL 許容", () => {
		expect(findColumn(columns, "recruitUrl").notNull).toBe(false);
		expect(findColumn(columns, "homepageUrl").notNull).toBe(false);
		expect(findColumn(columns, "memo").notNull).toBe(false);
	});

	test("createdAt / updatedAt は NOT NULL", () => {
		expect(findColumn(columns, "createdAt").notNull).toBe(true);
		expect(findColumn(columns, "updatedAt").notNull).toBe(true);
	});

	test("(id, userId) の複合UNIQUE制約を持つ（子テーブルの複合FKの参照先になる）", () => {
		const uc = uniqueConstraints.find(
			(u) => u.name === "companies_id_user_id_unique",
		);

		expect(uc).toBeDefined();
		expect(uc?.columns.map((c) => c.name)).toEqual(["id", "userId"]);
	});
});

describe("applications テーブル", () => {
	const { columns, indexes, foreignKeys, uniqueConstraints } =
		getTableConfig(applications);

	test("companyId + userId の複合外部キーで companies を参照する（削除時cascade）", () => {
		const fk = findForeignKeyTo(foreignKeys, companies);
		const ref = fk.reference();

		expect(ref.columns.map((c) => c.name)).toEqual(["companyId", "userId"]);
		expect(ref.foreignColumns.map((c) => c.name)).toEqual(["id", "userId"]);
		expect(fk.onDelete).toBe("cascade");
	});

	test("(id, userId) の複合UNIQUE制約を持つ（events/documentsの複合FKの参照先になる）", () => {
		const uc = uniqueConstraints.find(
			(u) => u.name === "applications_id_user_id_unique",
		);

		expect(uc).toBeDefined();
		expect(uc?.columns.map((c) => c.name)).toEqual(["id", "userId"]);
	});

	test("type / status / priority は NOT NULL、closeReason は NULL 許容", () => {
		expect(findColumn(columns, "type").notNull).toBe(true);
		expect(findColumn(columns, "status").notNull).toBe(true);
		expect(findColumn(columns, "priority").notNull).toBe(true);
		expect(findColumn(columns, "closeReason").notNull).toBe(false);
	});

	test("status のデフォルトは INTERESTED、priority のデフォルトは MID", () => {
		expect(findColumn(columns, "status").default).toBe("INTERESTED");
		expect(findColumn(columns, "priority").default).toBe("MID");
	});

	test("appliedAt / closedAt は NULL 許容", () => {
		expect(findColumn(columns, "appliedAt").notNull).toBe(false);
		expect(findColumn(columns, "closedAt").notNull).toBe(false);
	});

	test("userId + status の複合インデックスを持つ", () => {
		const index = indexes.find(
			(i) => i.config.name === "applications_user_id_status_idx",
		);

		expect(index).toBeDefined();
		expect(index?.config.columns.map((c) => (c as AnyPgColumn).name)).toEqual([
			"userId",
			"status",
		]);
	});

	test("companyId のインデックスを持つ（FK・cascade削除の検索性能のため）", () => {
		const index = indexes.find(
			(i) => i.config.name === "applications_company_id_idx",
		);

		expect(index).toBeDefined();
		expect(index?.config.columns.map((c) => (c as AnyPgColumn).name)).toEqual([
			"companyId",
		]);
	});
});

describe("events テーブル", () => {
	const { columns, indexes, foreignKeys } = getTableConfig(events);

	test("applicationId + userId の複合外部キーで applications を参照する（削除時cascade）", () => {
		const fk = findForeignKeyTo(foreignKeys, applications);
		const ref = fk.reference();

		expect(ref.columns.map((c) => c.name)).toEqual(["applicationId", "userId"]);
		expect(ref.foreignColumns.map((c) => c.name)).toEqual(["id", "userId"]);
		expect(fk.onDelete).toBe("cascade");
	});

	test("title / scheduledAt は NOT NULL", () => {
		expect(findColumn(columns, "title").notNull).toBe(true);
		expect(findColumn(columns, "scheduledAt").notNull).toBe(true);
	});

	test("meetingUrl / result / memo は NULL 許容", () => {
		expect(findColumn(columns, "meetingUrl").notNull).toBe(false);
		expect(findColumn(columns, "result").notNull).toBe(false);
		expect(findColumn(columns, "memo").notNull).toBe(false);
	});

	test("userId + scheduledAt の複合インデックスを持つ", () => {
		const index = indexes.find(
			(i) => i.config.name === "events_user_id_scheduled_at_idx",
		);

		expect(index).toBeDefined();
		expect(index?.config.columns.map((c) => (c as AnyPgColumn).name)).toEqual([
			"userId",
			"scheduledAt",
		]);
	});

	test("applicationId のインデックスを持つ（FK・cascade削除の検索性能のため）", () => {
		const index = indexes.find(
			(i) => i.config.name === "events_application_id_idx",
		);

		expect(index).toBeDefined();
		expect(index?.config.columns.map((c) => (c as AnyPgColumn).name)).toEqual([
			"applicationId",
		]);
	});
});

describe("documents テーブル", () => {
	const { columns, indexes, foreignKeys } = getTableConfig(documents);

	test("applicationId + userId の複合外部キーで applications を参照する（削除時cascade）", () => {
		const fk = findForeignKeyTo(foreignKeys, applications);
		const ref = fk.reference();

		expect(ref.columns.map((c) => c.name)).toEqual(["applicationId", "userId"]);
		expect(ref.foreignColumns.map((c) => c.name)).toEqual(["id", "userId"]);
		expect(fk.onDelete).toBe("cascade");
	});

	test("type / title は NOT NULL", () => {
		expect(findColumn(columns, "type").notNull).toBe(true);
		expect(findColumn(columns, "title").notNull).toBe(true);
	});

	test("content / fileUrl は NULL 許容", () => {
		expect(findColumn(columns, "content").notNull).toBe(false);
		expect(findColumn(columns, "fileUrl").notNull).toBe(false);
	});

	test("applicationId のインデックスを持つ（FK・cascade削除の検索性能のため）", () => {
		const index = indexes.find(
			(i) => i.config.name === "documents_application_id_idx",
		);

		expect(index).toBeDefined();
		expect(index?.config.columns.map((c) => (c as AnyPgColumn).name)).toEqual([
			"applicationId",
		]);
	});
});

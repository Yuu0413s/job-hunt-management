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

function firstForeignKey(foreignKeys: ForeignKey[]) {
	const fk = foreignKeys[0];
	if (!fk) {
		throw new Error("foreign key not found");
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
	const { columns } = getTableConfig(companies);

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
});

describe("applications テーブル", () => {
	const { columns, indexes, foreignKeys } = getTableConfig(applications);

	test("companyId は companies.id への外部キー（削除時cascade）", () => {
		const fk = firstForeignKey(foreignKeys);
		const ref = fk.reference();

		expect(ref.foreignTable).toBe(companies);
		expect(ref.columns.map((c) => c.name)).toEqual(["companyId"]);
		expect(fk.onDelete).toBe("cascade");
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
});

describe("events テーブル", () => {
	const { columns, indexes, foreignKeys } = getTableConfig(events);

	test("applicationId は applications.id への外部キー（削除時cascade）", () => {
		const fk = firstForeignKey(foreignKeys);
		const ref = fk.reference();

		expect(ref.foreignTable).toBe(applications);
		expect(ref.columns.map((c) => c.name)).toEqual(["applicationId"]);
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
});

describe("documents テーブル", () => {
	const { columns, foreignKeys } = getTableConfig(documents);

	test("applicationId は applications.id への外部キー（削除時cascade）", () => {
		const fk = firstForeignKey(foreignKeys);
		const ref = fk.reference();

		expect(ref.foreignTable).toBe(applications);
		expect(ref.columns.map((c) => c.name)).toEqual(["applicationId"]);
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
});

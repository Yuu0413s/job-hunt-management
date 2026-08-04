import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

export const applicationTypeEnum = pgEnum("application_type", [
	"FULL_TIME",
	"INTERNSHIP",
]);

export const applicationStatusEnum = pgEnum("application_status", [
	"INTERESTED",
	"ES_WRITING",
	"APPLIED",
	"BRIEFING",
	"CASUAL",
	"INTERVIEW",
	"OFFER",
	"CLOSED",
]);

export const closeReasonEnum = pgEnum("close_reason", [
	"REJECTED",
	"WITHDRAWN",
	"UNKNOWN",
]);

export const priorityEnum = pgEnum("priority", ["HIGH", "MID", "LOW"]);

export const companies = pgTable(
	"companies",
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: text().notNull(),
		name: text().notNull(),
		recruitUrl: text(),
		homepageUrl: text(),
		memo: text(),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	// applications からの複合外部キー（companyId, userId）が参照するために必要。
	// これにより、別ユーザーの company を companyId だけ書き換えて参照することをDB側で防げる。
	(t) => [unique("companies_id_user_id_unique").on(t.id, t.userId)],
);

export const applications = pgTable(
	"applications",
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: text().notNull(),
		companyId: uuid().notNull(),
		type: applicationTypeEnum().notNull(),
		status: applicationStatusEnum().notNull().default("INTERESTED"),
		closeReason: closeReasonEnum(),
		priority: priorityEnum().notNull().default("MID"),
		memo: text(),
		appliedAt: timestamp(),
		closedAt: timestamp(),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		index("applications_user_id_status_idx").on(t.userId, t.status),
		index("applications_company_id_idx").on(t.companyId),
		unique("applications_id_user_id_unique").on(t.id, t.userId),
		// companyId 単体ではなく (companyId, userId) の複合外部キーにすることで、
		// 他ユーザーの company を誤って参照するデータをDB制約レベルで防ぐ。
		foreignKey({
			columns: [t.companyId, t.userId],
			foreignColumns: [companies.id, companies.userId],
		}).onDelete("cascade"),
	],
);

export const events = pgTable(
	"events",
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: text().notNull(),
		applicationId: uuid().notNull(),
		title: text().notNull(),
		scheduledAt: timestamp().notNull(),
		meetingUrl: text(),
		result: text(),
		memo: text(),
	},
	(t) => [
		index("events_user_id_scheduled_at_idx").on(t.userId, t.scheduledAt),
		index("events_application_id_idx").on(t.applicationId),
		foreignKey({
			columns: [t.applicationId, t.userId],
			foreignColumns: [applications.id, applications.userId],
		}).onDelete("cascade"),
	],
);

export const documents = pgTable(
	"documents",
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: text().notNull(),
		applicationId: uuid().notNull(),
		type: text().notNull(),
		title: text().notNull(),
		content: text(),
		fileUrl: text(),
	},
	(t) => [
		index("documents_application_id_idx").on(t.applicationId),
		foreignKey({
			columns: [t.applicationId, t.userId],
			foreignColumns: [applications.id, applications.userId],
		}).onDelete("cascade"),
	],
);

export const companiesRelations = relations(companies, ({ many }) => ({
	applications: many(applications),
}));

export const applicationsRelations = relations(
	applications,
	({ one, many }) => ({
		company: one(companies, {
			fields: [applications.companyId],
			references: [companies.id],
		}),
		events: many(events),
		documents: many(documents),
	}),
);

export const eventsRelations = relations(events, ({ one }) => ({
	application: one(applications, {
		fields: [events.applicationId],
		references: [applications.id],
	}),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
	application: one(applications, {
		fields: [documents.applicationId],
		references: [applications.id],
	}),
}));

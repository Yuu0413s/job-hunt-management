import { relations } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
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

export const companies = pgTable("companies", {
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
});

export const applications = pgTable(
	"applications",
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: text().notNull(),
		companyId: uuid()
			.notNull()
			.references(() => companies.id, { onDelete: "cascade" }),
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
	(t) => [index("applications_user_id_status_idx").on(t.userId, t.status)],
);

export const events = pgTable(
	"events",
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: text().notNull(),
		applicationId: uuid()
			.notNull()
			.references(() => applications.id, { onDelete: "cascade" }),
		title: text().notNull(),
		scheduledAt: timestamp().notNull(),
		meetingUrl: text(),
		result: text(),
		memo: text(),
	},
	(t) => [index("events_user_id_scheduled_at_idx").on(t.userId, t.scheduledAt)],
);

export const documents = pgTable("documents", {
	id: uuid().primaryKey().defaultRandom(),
	userId: text().notNull(),
	applicationId: uuid()
		.notNull()
		.references(() => applications.id, { onDelete: "cascade" }),
	type: text().notNull(),
	title: text().notNull(),
	content: text(),
	fileUrl: text(),
});

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

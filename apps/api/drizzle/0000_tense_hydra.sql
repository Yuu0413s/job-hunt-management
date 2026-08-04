CREATE TYPE "public"."application_status" AS ENUM('INTERESTED', 'ES_WRITING', 'APPLIED', 'BRIEFING', 'CASUAL', 'INTERVIEW', 'OFFER', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."application_type" AS ENUM('FULL_TIME', 'INTERNSHIP');--> statement-breakpoint
CREATE TYPE "public"."close_reason" AS ENUM('REJECTED', 'WITHDRAWN', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('HIGH', 'MID', 'LOW');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company_id" uuid NOT NULL,
	"type" "application_type" NOT NULL,
	"status" "application_status" DEFAULT 'INTERESTED' NOT NULL,
	"close_reason" "close_reason",
	"priority" "priority" DEFAULT 'MID' NOT NULL,
	"memo" text,
	"applied_at" timestamp,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"recruit_url" text,
	"homepage_url" text,
	"memo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"application_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"file_url" text
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"application_id" uuid NOT NULL,
	"title" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"meeting_url" text,
	"result" text,
	"memo" text
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_user_id_status_idx" ON "applications" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "events_user_id_scheduled_at_idx" ON "events" USING btree ("user_id","scheduled_at");
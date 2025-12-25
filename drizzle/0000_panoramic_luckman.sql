CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"body" text,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "deposts" (
	"post_id" integer PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"body" text,
	"tags" text[],
	"comments_count" integer,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"body" text,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100)
);

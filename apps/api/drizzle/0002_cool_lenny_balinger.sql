CREATE TABLE "files" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"ownerId" uuid NOT NULL,
	"folderId" uuid,
	"blobUrl" text NOT NULL,
	"blobPathname" text NOT NULL,
	"isPublic" boolean DEFAULT false NOT NULL,
	"size" bigint,
	"contentType" varchar(255),
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "files_owner_folder_active_sort_idx" ON "files" USING btree ("ownerId","folderId","isDeleted","sortOrder");--> statement-breakpoint
CREATE INDEX "files_owner_active_name_idx" ON "files" USING btree ("ownerId","isDeleted","name");
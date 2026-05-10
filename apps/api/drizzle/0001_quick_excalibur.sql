ALTER TABLE "folders" ADD COLUMN "sortOrder" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "folders_owner_parent_active_sort_idx" ON "folders" USING btree ("ownerId","parentFolderId","isDeleted","sortOrder");--> statement-breakpoint
CREATE INDEX "folders_owner_active_name_idx" ON "folders" USING btree ("ownerId","isDeleted","name");
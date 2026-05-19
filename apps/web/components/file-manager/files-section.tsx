"use client";

import { FC } from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { FileCard } from "./file-card";
import type { FileRecord } from "@/lib/types";
import { useFileBrowserStore } from "@/store/file-browser-store";
import { useSession } from "@/lib/auth/client";

interface FilesSectionProps {
  files: FileRecord[];
  searchQuery: string;
  onDragEnd: (event: DragEndEvent) => void;
}

export const FilesSection: FC<FilesSectionProps> = ({
  files,
  searchQuery,
  onDragEnd,
}) => {
  const { data: session } = useSession();
  const { openFilePermissions, openEditFile } = useFileBrowserStore();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  return (
    <section aria-label="Files">
      <h2 className="text-base font-semibold text-foreground mb-3">Files</h2>
      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {searchQuery ? "No files match your search." : "No files found."}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={files.map((f) => f.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-3">
              {files.map((file) => (
                <div key={file.id} className="w-60">
                  <FileCard
                    file={file}
                    currentUserId={session?.user?.id ?? ""}
                    onPermissions={openFilePermissions}
                    onEdit={openEditFile}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
};

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
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { FolderCard } from "./folder-card";
import type { Folder } from "@/lib/types";
import { useFileBrowserStore } from "@/store/file-browser-store";

interface FoldersSectionProps {
  folders: Folder[];
  currentUserId: string;
  searchQuery: string;
  onDragEnd: (event: DragEndEvent) => void;
}

export const FoldersSection: FC<FoldersSectionProps> = ({
  folders,
  currentUserId,
  searchQuery,
  onDragEnd,
}) => {
  const { openEditFolder, openFolderPermissions } = useFileBrowserStore();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  return (
    <section aria-label="Folders">
      <h2 className="text-base font-semibold text-foreground mb-3">Folders</h2>
      {folders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {searchQuery ? "No folders match your search." : "No folders found."}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={folders.map((f) => f.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-3">
              {folders.map((folder) => (
                <div key={folder.id} className="w-52">
                  <FolderCard
                    folder={folder}
                    currentUserId={currentUserId}
                    onEdit={openEditFolder}
                    onPermissions={openFolderPermissions}
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

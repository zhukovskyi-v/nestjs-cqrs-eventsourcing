"use client";

import { FC, useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { SearchBar } from "./search-bar";
import { FoldersSection } from "./folders-section";
import { FilesSection } from "./files-section";
import type { FileRecord, Folder } from "@/lib/types";
import { useFolders, useReorderFolders } from "@/lib/hooks/use-folders";
import { useFiles, useReorderFiles } from "@/lib/hooks/use-files";
import { useSearchParams } from "next/navigation";

interface BrowserContentProps {
  currentUserId: string;
}

export const BrowserContent: FC<BrowserContentProps> = ({ currentUserId }) => {
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folder") ?? null;
  const { data: folders = [], isLoading: foldersLoading } =
    useFolders(currentFolderId);
  const { data: files = [], isLoading: filesLoading } =
    useFiles(currentFolderId);
  const [searchQuery, setSearchQuery] = useState("");

  // Mutations
  const reorderFoldersMutation = useReorderFolders();
  const reorderFilesMutation = useReorderFiles();

  // Local state for optimistic reordering
  const [localFolders, setLocalFolders] = useState<Folder[]>([]);
  const [localFiles, setLocalFiles] = useState<FileRecord[]>([]);

  // Sync with server data
  const displayFolders = localFolders.length > 0 ? localFolders : folders;
  const displayFiles = localFiles.length > 0 ? localFiles : files;

  // Filter by search query
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return displayFolders;
    return displayFolders.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [displayFolders, searchQuery]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return displayFiles;
    return displayFiles.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [displayFiles, searchQuery]);

  // ─── Drag end: folders ──────────────────────────────────────────────────────
  function handleFolderDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = displayFolders.findIndex((f) => f.id === active.id);
    const newIndex = displayFolders.findIndex((f) => f.id === over.id);
    const reordered = arrayMove(displayFolders, oldIndex, newIndex);

    setLocalFolders(reordered);
    reorderFoldersMutation.mutate(
      {
        parentFolderId: currentFolderId,
        orderedIds: reordered.map((f) => f.id),
      },
      {
        onSettled: () => setLocalFolders([]),
      },
    );
  }

  // ─── Drag end: files ────────────────────────────────────────────────────────
  function handleFileDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = displayFiles.findIndex((f) => f.id === active.id);
    const newIndex = displayFiles.findIndex((f) => f.id === over.id);
    const reordered = arrayMove(displayFiles, oldIndex, newIndex);

    setLocalFiles(reordered);
    reorderFilesMutation.mutate(
      reordered.map((f, i) => ({ id: f.id, sort_order: i })),
      {
        onSettled: () => setLocalFiles([]),
      },
    );
  }

  return (
    <>
      {/* Search + Actions */}
      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {foldersLoading || filesLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : (
        <>
          {/* Folders Section */}
          <FoldersSection
            folders={filteredFolders}
            currentUserId={currentUserId}
            searchQuery={searchQuery}
            onDragEnd={handleFolderDragEnd}
          />

          {/* Files Section */}
          <FilesSection
            files={filteredFiles}
            currentUserId={currentUserId}
            searchQuery={searchQuery}
            onDragEnd={handleFileDragEnd}
          />
        </>
      )}
    </>
  );
};

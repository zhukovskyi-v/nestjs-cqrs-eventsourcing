"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderPlus, Upload, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "./breadcrumbs";
import { FolderCard } from "./folder-card";
import { FileCard } from "./file-card";
import { CreateFolderDialog } from "./create-folder-dialog";
import { UploadFileDialog } from "./upload-file-dialog";
import { PermissionsDialog } from "./permissions-dialog";
import { EditFileDialog } from "./edit-file-dialog";
import { FolderOpen } from "lucide-react";
import type { Folder, FileRecord, BreadcrumbItem } from "@/lib/types";
import {
  searchFolders,
  searchFiles,
  reorderFolders,
  reorderFiles,
} from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

interface FileBrowserProps {
  folders: Folder[];
  files: FileRecord[];
  breadcrumbs: BreadcrumbItem[];
  currentFolderId: string | null;
  currentUserId: string;
  userEmail: string;
  isAnonymous: boolean;
}

export function FileBrowser({
  folders: initialFolders,
  files: initialFiles,
  breadcrumbs,
  currentFolderId,
  currentUserId,
  userEmail,
  isAnonymous,
}: FileBrowserProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [files, setFiles] = useState<FileRecord[]>(initialFiles);
  const [isSearching, startSearch] = useTransition();

  // Dialog state
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileRecord | null>(null);
  const [permissionsTarget, setPermissionsTarget] = useState<{
    id: string;
    name: string;
    type: "folder" | "file";
  } | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setFolders(initialFolders);
      setFiles(initialFiles);
      return;
    }
    startSearch(async () => {
      try {
        const [f, fi] = await Promise.all([
          searchFolders(searchQuery, currentFolderId),
          searchFiles(searchQuery, currentFolderId),
        ]);
        setFolders(f);
        setFiles(fi);
      } catch {
        toast.error("Search failed");
      }
    });
  }, [searchQuery, currentFolderId, initialFolders, initialFiles]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") {
      setSearchQuery("");
      setFolders(initialFolders);
      setFiles(initialFiles);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const openCreateFolder = () => {
    setEditingFolder(null);
    setFolderDialogOpen(true);
  };

  const openEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderDialogOpen(true);
  };

  const openFolderPermissions = (folder: Folder) => {
    setPermissionsTarget({ id: folder.id, name: folder.name, type: "folder" });
  };

  const openFilePermissions = (file: FileRecord) => {
    setPermissionsTarget({ id: file.id, name: file.name, type: "file" });
  };

  const openEditFile = (file: FileRecord) => {
    setEditingFile(file);
  };

  const onDialogSuccess = () => {
    router.refresh();
  };

  // ─── Drag end: folders ──────────────────────────────────────────────────────
  function handleFolderDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = folders.findIndex((f) => f.id === active.id);
    const newIndex = folders.findIndex((f) => f.id === over.id);
    const reordered = arrayMove(folders, oldIndex, newIndex);

    setFolders(reordered);
    reorderFolders(
      reordered.map((f, i) => ({ id: f.id, sort_order: i })),
    ).catch(() => toast.error("Failed to save folder order"));
  }

  // ─── Drag end: files ────────────────────────────────────────────────────────
  function handleFileDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = files.findIndex((f) => f.id === active.id);
    const newIndex = files.findIndex((f) => f.id === over.id);
    const reordered = arrayMove(files, oldIndex, newIndex);

    setFiles(reordered);
    reorderFiles(reordered.map((f, i) => ({ id: f.id, sort_order: i }))).catch(
      () => toast.error("Failed to save file order"),
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground">CQRS Files</span>
          </div>
          <div className="flex items-center gap-2">
            {isAnonymous ? (
              <span className="text-sm text-muted-foreground hidden sm:flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border">
                  Guest
                </span>
              </span>
            ) : (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {userEmail}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              aria-label={isAnonymous ? "Exit guest session" : "Sign out"}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

        {/* Search + Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 gap-2 min-w-0">
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setFolders(initialFolders);
                  setFiles(initialFiles);
                }
              }}
              onKeyDown={handleSearchKeyDown}
              className="max-w-md"
              aria-label="Search input"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              variant="outline"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={openCreateFolder} variant="outline" size="sm">
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            <Button onClick={() => setUploadDialogOpen(true)} size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Folders Section */}
        <section aria-label="Folders">
          <h2 className="text-base font-semibold text-foreground mb-3">
            Folders
          </h2>
          {folders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No folders found.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleFolderDragEnd}
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

        {/* Files Section */}
        <section aria-label="Files">
          <h2 className="text-base font-semibold text-foreground mb-3">
            Files
          </h2>
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files found.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleFileDragEnd}
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
                        currentUserId={currentUserId}
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
      </main>

      {/* Dialogs */}
      <CreateFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        parentId={currentFolderId}
        editingFolder={editingFolder}
      />

      <UploadFileDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        folderId={currentFolderId}
      />

      <EditFileDialog
        open={!!editingFile}
        onOpenChange={(open) => {
          if (!open) setEditingFile(null);
        }}
        file={editingFile}
      />

      {permissionsTarget && (
        <PermissionsDialog
          open={!!permissionsTarget}
          onOpenChange={(open) => {
            if (!open) setPermissionsTarget(null);
          }}
          resourceId={permissionsTarget.id}
          resourceType={permissionsTarget.type}
          resourceName={permissionsTarget.name}
        />
      )}
    </div>
  );
}

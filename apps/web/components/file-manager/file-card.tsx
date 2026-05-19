"use client";

import Link from "next/link";
import { EyeOff, Globe, GripVertical, Image } from "lucide-react";

import type { FileRecord } from "@/lib/types";
import { useCloneFile, useDeleteFile } from "@/lib/hooks/use-files";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFileBrowserStore } from "@/store/file-browser-store";
import { formatSize } from "@/lib/utils";
import { FileDropdownActions } from "@/components/file-manager/file-dropdown-actions";

interface FileCardProps {
  file: FileRecord;
  currentUserId: string;
  onPermissions: (file: FileRecord) => void;
  onEdit: (file: FileRecord) => void;
}

export function FileCard({
  file,
  currentUserId,
  onPermissions,
  onEdit,
}: FileCardProps) {
  const deleteMutation = useDeleteFile();
  const cloneMutation = useCloneFile();
  const isPending = deleteMutation.isPending || cloneMutation.isPending;
  const isOwner = file.ownerId === currentUserId;
  const showConfirmDialog = useFileBrowserStore(
    (state) => state.showConfirmDialog,
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    showConfirmDialog({
      title: "Are you sure?",
      description: `Are you sure you want to delete "${file.name}"?`,
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: () => {
        deleteMutation.mutate({ id: file.id });
      },
    });
  };

  const handleClone = () => {
    cloneMutation.mutate({ id: file.id });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-2 border border-border rounded-lg px-3 py-3 bg-card hover:bg-accent/50 hover:border-primary/30 transition-all min-w-0"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <Link
        href={`/browse/files/${file.id}`}
        className="flex items-center gap-2 flex-1 min-w-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Open ${file.name}`}
      >
        {/* Thumbnail or icon */}
        <div className="w-8 h-8 rounded overflow-hidden shrink-0 bg-muted flex items-center justify-center">
          {file.contentType?.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.blobUrl}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {file.size ? (
              <span className="text-xs text-muted-foreground">
                {formatSize(file.size)}
              </span>
            ) : null}
            {file.isPublic ? (
              <span className="flex items-center gap-0.5 text-xs text-emerald-600">
                <Globe className="w-3 h-3" />
                Public
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <EyeOff className="w-3 h-3" />
                Private
              </span>
            )}
          </div>
        </div>
      </Link>

      <FileDropdownActions
        file={file}
        isOwner={isOwner}
        onEdit={onEdit}
        handleClone={handleClone}
        handleDelete={handleDelete}
        isPending={isPending}
        onPermissions={onPermissions}
      />
    </div>
  );
}

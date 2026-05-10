"use client";

import {
  Folder,
  MoreHorizontal,
  Pencil,
  Trash2,
  Lock,
  Copy,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Folder as FolderType } from "@/lib/types";
import { useDeleteFolder, useCloneFolder } from "@/lib/hooks/use-folders";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFileBrowserStore } from "@/store/file-browser-store";
import Link from "next/link";

interface FolderCardProps {
  folder: FolderType;
  currentUserId: string;
  onEdit: (folder: FolderType) => void;
  onPermissions: (folder: FolderType) => void;
}

export function FolderCard({
  folder,
  currentUserId,
  onEdit,
  onPermissions,
}: FolderCardProps) {
  const deleteMutation = useDeleteFolder();
  const cloneMutation = useCloneFolder();
  const isPending = deleteMutation.isPending || cloneMutation.isPending;
  const isOwner = folder.ownerId === currentUserId;
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
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleDelete() {
    showConfirmDialog({
      title: "Are you sure?",
      description: `Are you sure you want to delete "${folder.name}"? This will also delete all its contents.`,
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: () => {
        deleteMutation.mutate({ id: folder.id });
      },
    });
  }

  function handleClone() {
    cloneMutation.mutate({ id: folder.id });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-2 border border-border rounded-lg px-3 py-3 bg-card hover:bg-accent/50 hover:border-primary/30 transition-all cursor-pointer min-w-0"
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
        href={`/browse?folder=${folder.id}`}
        className="flex items-center gap-2 flex-1 min-w-0"
        aria-label={`Open folder ${folder.name}`}
      >
        <Folder className="w-5 h-5 text-primary flex-shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">
          {folder.name}
        </span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 flex-shrink-0"
            aria-label="Folder options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isOwner && (
            <DropdownMenuItem onClick={() => onEdit(folder)}>
              <Pencil className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
          )}
          {isOwner && (
            <DropdownMenuItem onClick={handleClone} disabled={isPending}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onPermissions(folder)}>
            <Lock className="w-4 h-4 mr-2" />
            Permissions
          </DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isPending}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

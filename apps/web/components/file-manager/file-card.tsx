'use client'

import { Image, MoreHorizontal, Trash2, Lock, Download, Globe, Pencil, Copy, GripVertical, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { FileRecord } from '@/lib/types'
import { useDeleteFile, useCloneFile } from '@/lib/hooks/use-files'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useFileBrowserStore } from '@/store/file-browser-store'

interface FileCardProps {
  file: FileRecord
  currentUserId: string
  onPermissions: (file: FileRecord) => void
  onEdit: (file: FileRecord) => void
}

function formatSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileCard({ file, currentUserId, onPermissions, onEdit }: FileCardProps) {
  const deleteMutation = useDeleteFile()
  const cloneMutation = useCloneFile()
  const isPending = deleteMutation.isPending || cloneMutation.isPending
  const isOwner = file.ownerId === currentUserId
  const showConfirmDialog = useFileBrowserStore((state) => state.showConfirmDialog)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  function handleDelete() {
    showConfirmDialog({
      title: "Are you sure?",
      description: `Are you sure you want to delete "${file.name}"?`,
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: () => {
        deleteMutation.mutate({ id: file.id })
      },
    })
  }

  function handleClone() {
    cloneMutation.mutate({ id: file.id })
  }

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
        className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Thumbnail or icon */}
      <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
        {file.contentType?.startsWith('image/') ? (
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
        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {file.size ? (
            <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 flex-shrink-0"
            aria-label="File options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href={file.blobUrl} target="_blank" rel="noreferrer" download={file.name}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
          </DropdownMenuItem>
          {isOwner && (
            <DropdownMenuItem onClick={() => onEdit(file)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          {isOwner && (
            <DropdownMenuItem onClick={handleClone} disabled={isPending}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onPermissions(file)}>
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
  )
}

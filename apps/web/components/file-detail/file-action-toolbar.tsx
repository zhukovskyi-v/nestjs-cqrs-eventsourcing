"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Download,
  FolderInput,
  Globe,
  Info,
  Link as LinkIcon,
  Lock,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useChangeFileVisibility,
  useCloneFile,
  useDeleteFile,
} from "@/lib/hooks/use-files";
import { useFileBrowserStore } from "@/store/file-browser-store";
import { MoveFileDialog } from "./move-file-dialog";
import type { FileRecord } from "@/lib/types";

interface FileActionToolbarProps {
  file: FileRecord;
  isOwner: boolean;
  onOpenDetailsPanel?: () => void;
}

export const FileActionToolbar: FC<FileActionToolbarProps> = ({
  file,
  isOwner,
  onOpenDetailsPanel,
}) => {
  const router = useRouter();
  const [moveOpen, setMoveOpen] = useState(false);

  const visibilityMutation = useChangeFileVisibility();
  const cloneMutation = useCloneFile();
  const deleteMutation = useDeleteFile();
  const showConfirmDialog = useFileBrowserStore(
    (state) => state.showConfirmDialog,
  );

  const busy =
    visibilityMutation.isPending ||
    cloneMutation.isPending ||
    deleteMutation.isPending;

  function handleCopyLink() {
    const url = `${window.location.origin}/browse/files/${file.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Link copied"))
      .catch(() => toast.error("Failed to copy link"));
  }

  function handleToggleVisibility() {
    visibilityMutation.mutate({ id: file.id, isPublic: !file.isPublic });
  }

  function handleDuplicate() {
    cloneMutation.mutate(
      { id: file.id },
      {
        onSuccess: (result) => {
          if (result?.id) router.push(`/browse/files/${result.id}`);
        },
      },
    );
  }

  function handleDelete() {
    showConfirmDialog({
      title: "Delete file?",
      description: `"${file.name}" will be permanently deleted.`,
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: () => {
        deleteMutation.mutate(
          { id: file.id },
          {
            onSuccess: () => {
              router.replace(
                file.folderId ? `/browse/${file.folderId}` : "/browse",
              );
            },
          },
        );
      },
    });
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon" aria-label="Download">
              <a
                href={file.blobUrl}
                target="_blank"
                rel="noreferrer"
                download={file.name}
              >
                <Download className="w-4 h-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download</TooltipContent>
        </Tooltip>

        {isOwner && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleVisibility}
                disabled={busy}
                aria-label={file.isPublic ? "Make private" : "Make public"}
              >
                {file.isPublic ? (
                  <Globe className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {file.isPublic ? "Make private" : "Make public"}
            </TooltipContent>
          </Tooltip>
        )}

        {file.isPublic && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyLink}
                aria-label="Copy share link"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy share link</TooltipContent>
          </Tooltip>
        )}

        {isOwner && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDuplicate}
                disabled={busy}
                aria-label="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>
        )}

        {isOwner && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMoveOpen(true)}
                aria-label="Move to folder"
              >
                <FolderInput className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to folder</TooltipContent>
          </Tooltip>
        )}

        {isOwner && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={busy}
                aria-label="Delete"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        )}

        {onOpenDetailsPanel && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenDetailsPanel}
                aria-label="Open details"
                className="lg:hidden"
              >
                <Info className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Details</TooltipContent>
          </Tooltip>
        )}
      </div>

      {isOwner && (
        <MoveFileDialog
          file={file}
          open={moveOpen}
          onOpenChange={setMoveOpen}
        />
      )}
    </>
  );
};

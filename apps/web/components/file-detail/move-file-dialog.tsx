"use client";

import { FC, useState } from "react";
import { Folder, FolderRoot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useFolders } from "@/lib/hooks/use-folders";
import { useMoveFile } from "@/lib/hooks/use-files";
import { cn } from "@/lib/utils";
import type { FileRecord } from "@/lib/types";

interface MoveFileDialogProps {
  file: FileRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MoveFileDialog: FC<MoveFileDialogProps> = ({
  file,
  open,
  onOpenChange,
}) => {
  const { data: folders = [], isLoading } = useFolders(null);
  const moveMutation = useMoveFile();
  const [selectedId, setSelectedId] = useState<string | null>(file.folderId);

  function handleConfirm() {
    moveMutation.mutate(
      { id: file.id, folderId: selectedId },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move file</DialogTitle>
          <DialogDescription>
            Choose a destination folder for &quot;{file.name}&quot;.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-72 -mx-1 px-1">
          <div className="flex flex-col gap-1 py-1">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              disabled={file.folderId === null}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-left",
                "hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed",
                selectedId === null && "bg-accent",
              )}
            >
              <FolderRoot className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1">Root</span>
              {file.folderId === null && (
                <span className="text-xs text-muted-foreground">
                  Current location
                </span>
              )}
            </button>

            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-md" />
                ))
              : folders.map((folder) => {
                  const isCurrent = folder.id === file.folderId;
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => setSelectedId(folder.id)}
                      disabled={isCurrent}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-left",
                        "hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed",
                        selectedId === folder.id && "bg-accent",
                      )}
                    >
                      <Folder className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{folder.name}</span>
                      {isCurrent && (
                        <span className="text-xs text-muted-foreground">
                          Current location
                        </span>
                      )}
                    </button>
                  );
                })}

            {!isLoading && folders.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No root-level folders. Move to root above.
              </p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={moveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              moveMutation.isPending || selectedId === file.folderId
            }
          >
            {moveMutation.isPending ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

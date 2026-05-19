import {
  Copy,
  Download,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FC } from "react";
import type { FileRecord } from "@/lib/types";

export const FileDropdownActions: FC<{
  file: FileRecord;
  isOwner: boolean;
  isPending: boolean;
  onEdit: (file: FileRecord) => void;
  onPermissions: (file: FileRecord) => void;
  handleClone: () => void;
  handleDelete: () => void;
}> = ({
  file,
  isOwner,
  onEdit,
  isPending,
  handleClone,
  handleDelete,
  onPermissions,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
          aria-label="File options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a
            href={file.blobUrl}
            target="_blank"
            rel="noreferrer"
            download={file.name}
          >
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
  );
};

"use client";

import { FC } from "react";
import {
  Activity,
  Copy,
  FilePlus2,
  FolderInput,
  Globe,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useFileHistory } from "@/lib/hooks/use-files";

interface FileActivityListProps {
  fileId: string;
}

function iconFor(eventType: string) {
  switch (eventType) {
    case "FileCreated":
      return FilePlus2;
    case "FileRenamed":
      return Pencil;
    case "FileVisibilityChanged":
      return Globe;
    case "FileMoved":
      return FolderInput;
    case "FileCloned":
      return Copy;
    case "FileDeleted":
      return Trash2;
    default:
      return Activity;
  }
}

export const FileActivityList: FC<FileActivityListProps> = ({ fileId }) => {
  const { data, isLoading, isError } = useFileHistory(fileId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">Could not load activity.</p>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {data.map((entry, idx) => {
        const Icon = iconFor(entry.eventType);
        const occurred = new Date(entry.occurredOn);
        const valid = !Number.isNaN(occurred.getTime());
        return (
          <li
            key={`${entry.eventType}-${entry.occurredOn}-${idx}`}
            className="flex items-start gap-3"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{entry.summary}</p>
              <p className="text-xs text-muted-foreground">
                {valid
                  ? formatDistanceToNow(occurred, { addSuffix: true })
                  : entry.occurredOn}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

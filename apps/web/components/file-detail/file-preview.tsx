"use client";

import { FC } from "react";
import {
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileText,
  FileVideo,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FileRecord } from "@/lib/types";
import { formatSize } from "@/lib/utils";

interface FilePreviewProps {
  file: FileRecord;
}

function pickIcon(contentType: string | null) {
  if (!contentType) return FileIcon;
  if (contentType.startsWith("video/")) return FileVideo;
  if (contentType.startsWith("audio/")) return FileAudio;
  if (contentType.startsWith("text/")) return FileText;
  if (
    contentType === "application/zip" ||
    contentType === "application/x-7z-compressed" ||
    contentType === "application/x-tar" ||
    contentType === "application/x-rar-compressed"
  )
    return FileArchive;
  return FileIcon;
}

export const FilePreview: FC<FilePreviewProps> = ({ file }) => {
  const wrapper =
    "bg-muted/30 dark:bg-muted/20 border border-border rounded-xl flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[60vh] overflow-hidden";

  if (file.contentType?.startsWith("image/")) {
    return (
      <div className={wrapper}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.blobUrl}
          alt={file.name}
          className="max-h-[70vh] max-w-full object-contain rounded-md"
        />
      </div>
    );
  }

  if (file.contentType === "application/pdf") {
    return (
      <div className={wrapper}>
        <iframe
          src={file.blobUrl}
          title={file.name}
          className="w-full h-[70vh] rounded-md border-0 bg-background"
        />
      </div>
    );
  }

  const Icon = pickIcon(file.contentType);
  return (
    <div className={wrapper}>
      <div className="flex flex-col items-center gap-4 text-center">
        <Icon
          className="w-24 h-24 text-muted-foreground"
          strokeWidth={1.25}
          aria-hidden
        />
        <div className="space-y-1">
          <p className="text-base font-medium text-foreground break-all">
            {file.name}
          </p>
          {file.size ? (
            <p className="text-xs text-muted-foreground">
              {file.contentType ?? "Unknown type"} · {formatSize(file.size)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Preview not available
            </p>
          )}
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={file.blobUrl} target="_blank" rel="noreferrer" download={file.name}>
            <Download className="w-4 h-4 mr-2" /> Download to view
          </a>
        </Button>
      </div>
    </div>
  );
};

"use client";

import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Home, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRenameFile } from "@/lib/hooks/use-files";
import type { BreadcrumbItem, FileRecord } from "@/lib/types";

interface FileDetailHeaderProps {
  file: FileRecord;
  folderPath: BreadcrumbItem[];
  isOwner: boolean;
  toolbar: React.ReactNode;
}

export const FileDetailHeader: FC<FileDetailHeaderProps> = ({
  file,
  folderPath,
  isOwner,
  toolbar,
}) => {
  const [isEditing, setEditing] = useState(false);
  const [draft, setDraft] = useState(file.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameMutation = useRenameFile();

  useEffect(() => {
    setDraft(file.name);
  }, [file.name]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function commit() {
    const next = draft.trim();
    if (!next || next === file.name) {
      setEditing(false);
      setDraft(file.name);
      return;
    }
    renameMutation.mutate(
      { id: file.id, name: next },
      {
        onSuccess: () => setEditing(false),
        onError: () => {
          setDraft(file.name);
          setEditing(false);
        },
      },
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setDraft(file.name);
      setEditing(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm flex-wrap">
        <Link
          href="/browse"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Root</span>
        </Link>
        {folderPath.map((item) => (
          <span key={item.id ?? "root"} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            {item.id ? (
              <Link
                href={`/browse/${item.id}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-muted-foreground">{item.name}</span>
            )}
          </span>
        ))}
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-foreground font-medium truncate max-w-[12rem] sm:max-w-xs">
          {file.name}
        </span>
      </nav>

      <div className="flex items-start sm:items-center gap-3 flex-col sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commit}
              onKeyDown={onKeyDown}
              disabled={renameMutation.isPending}
              aria-label="Rename file"
              className="text-lg lg:text-xl font-medium h-10 max-w-md"
            />
          ) : (
            <h1
              className="text-lg lg:text-xl font-medium tracking-tight truncate"
              title={file.name}
            >
              {file.name}
            </h1>
          )}
          {isOwner && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setEditing(true)}
              aria-label="Rename file"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1">{toolbar}</div>
      </div>
    </div>
  );
};

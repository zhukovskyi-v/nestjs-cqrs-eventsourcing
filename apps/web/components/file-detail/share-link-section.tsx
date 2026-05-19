"use client";

import { FC, useEffect, useState } from "react";
import { Copy, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useChangeFileVisibility } from "@/lib/hooks/use-files";
import type { FileRecord } from "@/lib/types";

interface ShareLinkSectionProps {
  file: FileRecord;
  isOwner: boolean;
}

export const ShareLinkSection: FC<ShareLinkSectionProps> = ({
  file,
  isOwner,
}) => {
  const mutation = useChangeFileVisibility();
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/browse/files/${file.id}`);
    }
  }, [file.id]);

  function handleCopy() {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => toast.success("Link copied"))
      .catch(() => toast.error("Failed to copy link"));
  }

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium flex items-center gap-1.5">
            {file.isPublic ? (
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            {file.isPublic ? "Public" : "Private"}
          </p>
          <p className="text-xs text-muted-foreground">
            {file.isPublic
              ? "Anyone with the link can view this file."
              : "Only you can access this file."}
          </p>
        </div>
        {isOwner && (
          <Switch
            checked={file.isPublic}
            disabled={mutation.isPending}
            onCheckedChange={(checked) =>
              mutation.mutate({ id: file.id, isPublic: checked })
            }
            aria-label="Toggle public visibility"
          />
        )}
      </div>

      {file.isPublic && shareUrl && (
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={shareUrl}
            onFocus={(event) => event.currentTarget.select()}
            className="text-xs h-8"
            aria-label="Share link"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            aria-label="Copy share link"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

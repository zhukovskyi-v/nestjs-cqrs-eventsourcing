"use client";

import { FC, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useFile } from "@/lib/hooks/use-files";
import { useFolderPath } from "@/lib/hooks/use-folders";
import type { BreadcrumbItem } from "@/lib/types";
import { FileDetailHeader } from "./file-detail-header";
import { FilePreview } from "./file-preview";
import { FileActionToolbar } from "./file-action-toolbar";
import { FileDetailsPanel } from "./file-details-panel";
import { useSession } from "@/lib/auth/client";

interface FileDetailPageProps {
  fileId: string;
}

export const FileDetailPage: FC<FileDetailPageProps> = ({ fileId }) => {
  const { data } = useSession();
  const { data: file, isLoading, isError } = useFile(fileId);
  const { data: pathData = [] } = useFolderPath(file?.folderId ?? null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const folderPath: BreadcrumbItem[] = useMemo(() => {
    if (!file?.folderId || !pathData.length) return [];
    return pathData.map((item, i) =>
      i < pathData.length - 1
        ? { id: item.id, name: item.name }
        : { id: item.id, name: item.name },
    );
  }, [file?.folderId, pathData]);

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-6 py-6 space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
          <Skeleton className="min-h-[60vh] rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !file) {
    return (
      <main className="max-w-3xl mx-auto w-full px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-medium">File not found</h1>
        <p className="text-sm text-muted-foreground">
          This file may have been deleted or you don&apos;t have access to it.
        </p>
        <Button asChild variant="outline">
          <Link href="/browse">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to files
          </Link>
        </Button>
      </main>
    );
  }

  const isOwner = file.ownerId === data?.user.id;

  return (
    <main className="max-w-7xl mx-auto w-full px-4 lg:px-6 py-6 flex flex-col gap-6">
      <FileDetailHeader
        file={file}
        folderPath={folderPath}
        isOwner={isOwner}
        toolbar={
          <FileActionToolbar
            file={file}
            isOwner={isOwner}
            onOpenDetailsPanel={() => setDetailsOpen(true)}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <FilePreview file={file} />
        <aside className="hidden lg:block">
          <FileDetailsPanel
            file={file}
            folderPath={folderPath}
            isOwner={isOwner}
            ownerEmail={isOwner ? data?.user.email : null}
          />
        </aside>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-sm overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Details</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FileDetailsPanel
              file={file}
              folderPath={folderPath}
              isOwner={isOwner}
              ownerEmail={isOwner ? data?.user.email : null}
            />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
};

"use client";

import { FC, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { BrowserContent } from "./browser-content";
import { DialogsContainer } from "./dialogs-container";
import type { BreadcrumbItem } from "@/lib/types";
import { useFolderPath } from "@/lib/hooks/use-folders";
import { Breadcrumbs } from "./breadcrumbs";

interface FileBrowserClientProps {
  currentUserId: string;
  userEmail: string;
  isAnonymous: boolean;
}

export const FileBrowser: FC<FileBrowserClientProps> = ({
  currentUserId,
  userEmail,
  isAnonymous,
}) => {
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folder") ?? null;

  const { data: pathData = [] } = useFolderPath(currentFolderId);

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    if (!currentFolderId || pathData.length === 0) {
      return [];
    }
    return pathData.map((item, i) =>
      i < pathData.length - 1
        ? { id: item.id, name: item.name }
        : { id: null, name: item.name },
    );
  }, [currentFolderId, pathData]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
        {/* Breadcrumbs */}
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
        <BrowserContent currentUserId={currentUserId} />
      </main>

      <DialogsContainer currentFolderId={currentFolderId} />
    </div>
  );
};

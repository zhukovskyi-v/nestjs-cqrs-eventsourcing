"use client";

import { FC } from "react";
import { CreateFolderDialog } from "./create-folder-dialog";
import { UploadFileDialog } from "./upload-file-dialog";
import { EditFileDialog } from "./edit-file-dialog";
import { PermissionsDialog } from "./permissions-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Folder, FileRecord } from "@/lib/types";
import { useFileBrowserStore } from "@/store/file-browser-store";

interface DialogsContainerProps {
  currentFolderId: string | null;
}

export const DialogsContainer: FC<DialogsContainerProps> = ({
  currentFolderId,
}) => {
  const {
    folderDialogOpen,
    uploadDialogOpen,
    editingFolder,
    editingFile,
    permissionsTarget,
    confirmDialog,
    setFolderDialogOpen,
    setUploadDialogOpen,
    setEditingFile,
    setPermissionsTarget,
    closeConfirmDialog,
  } = useFileBrowserStore();
  return (
    <>
      <CreateFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        parentId={currentFolderId}
        editingFolder={editingFolder}
      />

      <UploadFileDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        folderId={currentFolderId}
      />

      <EditFileDialog
        open={!!editingFile}
        onOpenChange={(open) => {
          if (!open) setEditingFile(null);
        }}
        file={editingFile}
      />

      {permissionsTarget ? (
        <PermissionsDialog
          open={!!permissionsTarget}
          onOpenChange={(open) => {
            if (!open) setPermissionsTarget(null);
          }}
          resourceId={permissionsTarget.id}
          resourceType={permissionsTarget.type}
          resourceName={permissionsTarget.name}
        />
      ) : null}

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={closeConfirmDialog}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
      />
    </>
  );
};

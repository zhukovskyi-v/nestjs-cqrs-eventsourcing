import { create } from "zustand";
import type { FileRecord, Folder } from "@/lib/types";

interface PermissionsTarget {
  id: string;
  name: string;
  type: "folder" | "file";
}

interface ConfirmDialogState {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  variant?: "default" | "destructive";
}

interface FileBrowserState {
  // Dialog states
  folderDialogOpen: boolean;
  uploadDialogOpen: boolean;
  confirmDialog: ConfirmDialogState;
  
  // Editing states
  editingFolder: Folder | null;
  editingFile: FileRecord | null;
  permissionsTarget: PermissionsTarget | null;

  // Actions
  setFolderDialogOpen: (open: boolean) => void;
  setUploadDialogOpen: (open: boolean) => void;
  setEditingFolder: (folder: Folder | null) => void;
  setEditingFile: (file: FileRecord | null) => void;
  setPermissionsTarget: (target: PermissionsTarget | null) => void;
  setConfirmDialog: (state: Partial<ConfirmDialogState>) => void;
  closeConfirmDialog: () => void;

  // Composite actions
  openCreateFolder: () => void;
  openEditFolder: (folder: Folder) => void;
  openFolderPermissions: (folder: Folder) => void;
  openFilePermissions: (file: FileRecord) => void;
  openEditFile: (file: FileRecord) => void;
  openUploadDialog: () => void;
  
  // Confirm dialog helper
  showConfirmDialog: (config: {
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    variant?: "default" | "destructive";
  }) => void;
  
  // Reset actions
  closeAllDialogs: () => void;
}

export const useFileBrowserStore = create<FileBrowserState>((set) => ({
  // Initial state
  folderDialogOpen: false,
  uploadDialogOpen: false,
  confirmDialog: {
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  },
  editingFolder: null,
  editingFile: null,
  permissionsTarget: null,

  // Basic setters
  setFolderDialogOpen: (open) => set({ folderDialogOpen: open }),
  setUploadDialogOpen: (open) => set({ uploadDialogOpen: open }),
  setEditingFolder: (folder) => set({ editingFolder: folder }),
  setEditingFile: (file) => set({ editingFile: file }),
  setPermissionsTarget: (target) => set({ permissionsTarget: target }),
  setConfirmDialog: (state) =>
    set((prev) => ({
      confirmDialog: { ...prev.confirmDialog, ...state },
    })),
  closeConfirmDialog: () =>
    set((prev) => ({
      confirmDialog: { ...prev.confirmDialog, open: false },
    })),

  // Composite actions
  openCreateFolder: () =>
    set({ editingFolder: null, folderDialogOpen: true }),
  
  openEditFolder: (folder) =>
    set({ editingFolder: folder, folderDialogOpen: true }),
  
  openFolderPermissions: (folder) =>
    set({
      permissionsTarget: {
        id: folder.id,
        name: folder.name,
        type: "folder",
      },
    }),
  
  openFilePermissions: (file) =>
    set({
      permissionsTarget: {
        id: file.id,
        name: file.name,
        type: "file",
      },
    }),
  
  openEditFile: (file) =>
    set({ editingFile: file }),
  
  openUploadDialog: () =>
    set({ uploadDialogOpen: true }),

  // Confirm dialog helper
  showConfirmDialog: (config) =>
    set({
      confirmDialog: {
        open: true,
        title: config.title,
        description: config.description,
        onConfirm: config.onConfirm,
        confirmText: config.confirmText,
        variant: config.variant,
      },
    }),

  // Reset
  closeAllDialogs: () =>
    set({
      folderDialogOpen: false,
      uploadDialogOpen: false,
      confirmDialog: {
        open: false,
        title: "",
        description: "",
        onConfirm: () => {},
      },
      editingFolder: null,
      editingFile: null,
      permissionsTarget: null,
    }),
}));

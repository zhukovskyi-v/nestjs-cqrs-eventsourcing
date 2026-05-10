/**
 * Client-side API functions for file manager operations
 * These wrap the server actions for use with TanStack Query
 */

import type { FileRecord, Permission } from '@/lib/types'
import {
  getFiles as serverGetFiles,
  searchFiles as serverSearchFiles,
  createFileRecord as serverCreateFileRecord,
  updateFile as serverUpdateFile,
  deleteFile as serverDeleteFile,
  cloneFile as serverCloneFile,
  reorderFiles as serverReorderFiles,
  getPermissions as serverGetPermissions,
  addPermission as serverAddPermission,
  updatePermission as serverUpdatePermission,
  removePermission as serverRemovePermission,
} from '@/lib/actions'

// ─── Files ────────────────────────────────────────────────────────────────────

export const filesApi = {
  getAll: async (folderId: string | null): Promise<FileRecord[]> => {
    return serverGetFiles(folderId)
  },

  search: async (query: string, folderId: string | null): Promise<FileRecord[]> => {
    return serverSearchFiles(query, folderId)
  },

  create: async (params: {
    name: string
    folderId: string | null
    blobUrl: string
    blobPathname: string
    isPublic: boolean
    size: number | null
    contentType: string | null
  }): Promise<void> => {
    return serverCreateFileRecord(params)
  },

  update: async (params: {
    id: string
    updates: { name?: string; is_public?: boolean }
  }): Promise<void> => {
    return serverUpdateFile(params.id, params.updates)
  },

  delete: async (id: string): Promise<void> => {
    return serverDeleteFile(id)
  },

  clone: async (id: string): Promise<void> => {
    return serverCloneFile(id)
  },

  reorder: async (updates: Array<{ id: string; sort_order: number }>): Promise<void> => {
    return serverReorderFiles(updates)
  },
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export const permissionsApi = {
  getAll: async (resourceId: string): Promise<Permission[]> => {
    return serverGetPermissions(resourceId)
  },

  add: async (params: {
    resourceId: string
    resourceType: 'folder' | 'file'
    userEmail: string
    role: 'viewer' | 'editor'
  }): Promise<void> => {
    return serverAddPermission(params)
  },

  update: async (params: { id: string; role: 'viewer' | 'editor' }): Promise<void> => {
    return serverUpdatePermission(params.id, params.role)
  },

  remove: async (id: string): Promise<void> => {
    return serverRemovePermission(id)
  },
}

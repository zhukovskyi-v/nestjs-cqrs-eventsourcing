/**
 * Client-side API functions for permissions.
 * Files now flow through `@/lib/hooks/use-files` (oRPC + NestJS upload).
 */

import type { Permission } from '@/lib/types'
import {
  getPermissions as serverGetPermissions,
  addPermission as serverAddPermission,
  updatePermission as serverUpdatePermission,
  removePermission as serverRemovePermission,
} from '@/lib/actions'

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

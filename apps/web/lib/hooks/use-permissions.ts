import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { permissionsApi } from '@/lib/api/client'
import type { Permission } from '@/lib/types'
import { toast } from 'sonner'

// Query keys factory
export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'list'] as const,
  list: (resourceId: string) => [...permissionKeys.lists(), resourceId] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function usePermissions(resourceId: string | null) {
  return useQuery({
    queryKey: resourceId ? permissionKeys.list(resourceId) : ['permissions', 'empty'],
    queryFn: () => (resourceId ? permissionsApi.getAll(resourceId) : Promise.resolve([])),
    enabled: !!resourceId,
    staleTime: 30000, // 30 seconds
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useAddPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: permissionsApi.add,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.list(variables.resourceId),
      })
      toast.success('Permission added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add permission')
    },
  })
}

export function useUpdatePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: permissionsApi.update,
    onMutate: async (variables) => {
      const queryKey = permissionKeys.lists()
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueriesData({ queryKey })

      queryClient.setQueriesData<Permission[]>({ queryKey }, (old) => {
        if (!old) return old
        return old.map((perm) =>
          perm.id === variables.id ? { ...perm, role: variables.role } : perm
        )
      })

      return { previousData }
    },
    onError: (error: Error, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
      toast.error(error.message || 'Failed to update permission')
    },
    onSuccess: () => {
      toast.success('Permission updated successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() })
    },
  })
}

export function useRemovePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: permissionsApi.remove,
    onMutate: async (permissionId) => {
      const queryKey = permissionKeys.lists()
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueriesData({ queryKey })

      queryClient.setQueriesData<Permission[]>({ queryKey }, (old) => {
        if (!old) return old
        return old.filter((perm) => perm.id !== permissionId)
      })

      return { previousData }
    },
    onError: (error: Error, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
      toast.error(error.message || 'Failed to remove permission')
    },
    onSuccess: () => {
      toast.success('Permission removed successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() })
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { filesApi } from '@/lib/api/client'
import type { FileRecord } from '@/lib/types'
import { toast } from 'sonner'

// Query keys factory
export const fileKeys = {
  all: ['files'] as const,
  lists: () => [...fileKeys.all, 'list'] as const,
  list: (folderId: string | null) => [...fileKeys.lists(), folderId] as const,
  search: (query: string, folderId: string | null) =>
    [...fileKeys.all, 'search', query, folderId] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useFiles(folderId: string | null) {
  return useQuery({
    queryKey: fileKeys.list(folderId),
    queryFn: () => filesApi.getAll(folderId),
    staleTime: 30000, // 30 seconds
  })
}

export function useSearchFiles(query: string, folderId: string | null) {
  return useQuery({
    queryKey: fileKeys.search(query, folderId),
    queryFn: () => filesApi.search(query, folderId),
    enabled: query.trim().length > 0,
    staleTime: 10000, // 10 seconds
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: filesApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list(variables.folderId) })
      toast.success('File uploaded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload file')
    },
  })
}

export function useUpdateFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: filesApi.update,
    onMutate: async (variables) => {
      const queryKey = fileKeys.lists()
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueriesData({ queryKey })

      queryClient.setQueriesData<FileRecord[]>({ queryKey }, (old) => {
        if (!old) return old
        return old.map((file) =>
          file.id === variables.id ? { ...file, ...variables.updates } : file
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
      toast.error(error.message || 'Failed to update file')
    },
    onSuccess: () => {
      toast.success('File updated successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() })
    },
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: filesApi.delete,
    onMutate: async (fileId) => {
      const queryKey = fileKeys.lists()
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueriesData({ queryKey })

      queryClient.setQueriesData<FileRecord[]>({ queryKey }, (old) => {
        if (!old) return old
        return old.filter((file) => file.id !== fileId)
      })

      return { previousData }
    },
    onError: (error: Error, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
      toast.error(error.message || 'Failed to delete file')
    },
    onSuccess: () => {
      toast.success('File deleted successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() })
    },
  })
}

export function useCloneFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: filesApi.clone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() })
      toast.success('File cloned successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clone file')
    },
  })
}

export function useReorderFiles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: filesApi.reorder,
    onMutate: async (updates) => {
      const queryKey = fileKeys.lists()
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueriesData({ queryKey })

      queryClient.setQueriesData<FileRecord[]>({ queryKey }, (old) => {
        if (!old) return old
        const updated = [...old]
        updates.forEach(({ id, sort_order }) => {
          const index = updated.findIndex((f) => f.id === id)
          if (index !== -1) {
            updated[index] = { ...updated[index], sort_order }
          }
        })
        return updated.sort((a, b) => a.sort_order - b.sort_order)
      })

      return { previousData }
    },
    onError: (error: Error, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
      toast.error(error.message || 'Failed to reorder files')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() })
    },
  })
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { foldersApi } from "@/lib/api/client";
import type { Folder } from "@/lib/types";
import { toast } from "sonner";

export const folderKeys = {
  all: ["folders"] as const,
  lists: () => [...folderKeys.all, "list"] as const,
  list: (parentId: string | null) => [...folderKeys.lists(), parentId] as const,
  path: (folderId: string) => [...folderKeys.all, "path", folderId] as const,
  search: (query: string, parentId: string | null) =>
    [...folderKeys.all, "search", query, parentId] as const,
};

export function useFolders(parentId: string | null) {
  return useQuery({
    queryKey: folderKeys.list(parentId),
    queryFn: () => foldersApi.getAll(parentId),
    staleTime: 30000,
  });
}

export function useFolderPath(folderId: string | null) {
  return useQuery({
    queryKey: folderId
      ? folderKeys.path(folderId)
      : ["folders", "path", "root"],
    queryFn: () =>
      folderId ? foldersApi.getPath(folderId) : Promise.resolve([]),
    enabled: !!folderId,
    staleTime: 60000,
  });
}

export function useSearchFolders(query: string, parentId: string | null) {
  return useQuery({
    queryKey: folderKeys.search(query, parentId),
    queryFn: () => foldersApi.search(query, parentId),
    enabled: query.trim().length > 0,
    staleTime: 10000,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: foldersApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: folderKeys.list(variables.parentId),
      });
      toast.success("Folder created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create folder");
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: foldersApi.update,
    onMutate: async (variables) => {
      const queryKey = folderKeys.lists();
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueriesData({ queryKey });

      queryClient.setQueriesData<Folder[]>({ queryKey }, (old) => {
        if (!old) {
          return old;
        }
        return old.map((folder) =>
          folder.id === variables.id
            ? { ...folder, name: variables.name }
            : folder,
        );
      });

      return { previousData };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(error.message || "Failed to update folder");
    },
    onSuccess: () => {
      toast.success("Folder updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: foldersApi.delete,
    onMutate: async (folderId) => {
      const queryKey = folderKeys.lists();
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueriesData({ queryKey });

      queryClient.setQueriesData<Folder[]>({ queryKey }, (old) => {
        if (!old) {
          return old;
        }
        return old.filter((folder) => folder.id !== folderId);
      });

      return { previousData };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(error.message || "Failed to delete folder");
    },
    onSuccess: () => {
      toast.success("Folder deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

export function useCloneFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: foldersApi.clone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
      toast.success("Folder cloned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clone folder");
    },
  });
}

export function useReorderFolders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: foldersApi.reorder,
    onMutate: async (updates) => {
      const queryKey = folderKeys.lists();
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueriesData({ queryKey });

      queryClient.setQueriesData<Folder[]>({ queryKey }, (old) => {
        if (!old) {
          return old;
        }
        const updated = [...old];
        updates.forEach(({ id, sort_order }) => {
          const index = updated.findIndex((f) => f.id === id);
          if (index !== -1) {
            updated[index] = { ...updated[index], sort_order };
          }
        });
        return updated.sort((a, b) => a.sort_order - b.sort_order);
      });

      return { previousData };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(error.message || "Failed to reorder folders");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

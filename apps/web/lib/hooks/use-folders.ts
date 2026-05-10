import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Folder } from "@/lib/types";
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";

const folderListKey = () => orpc.folders.find.key();

export function useFolders(parentId: string | null) {
  return useQuery(
    orpc.folders.find.queryOptions({
      input: { parentFolderId: parentId },
      staleTime: 30000,
    }),
  );
}

export function useFolderPath(folderId: string | null) {
  return useQuery(
    orpc.folders.getPath.queryOptions({
      input: { id: folderId ?? "" },
      enabled: !!folderId,
      staleTime: 60000,
    }),
  );
}

export function useSearchFolders(query: string, parentId: string | null) {
  return useQuery(
    orpc.folders.search.queryOptions({
      input: { query, parentFolderId: parentId },
      enabled: query.trim().length > 0,
      staleTime: 10000,
    }),
  );
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.folders.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: folderListKey() });
        toast.success("Folder created successfully");
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to create folder");
      },
    }),
  );
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.folders.rename.mutationOptions({
      onMutate: async (variables) => {
        const queryKey = folderListKey();
        await queryClient.cancelQueries({ queryKey });

        const previousData = queryClient.getQueriesData({ queryKey });

        queryClient.setQueriesData<Folder[]>({ queryKey }, (old) => {
          if (!old) return old;
          return old.map((folder) =>
            folder.id === variables.id
              ? { ...folder, name: variables.name }
              : folder,
          );
        });

        return { previousData };
      },
      onError: (error, _variables, context) => {
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
        queryClient.invalidateQueries({ queryKey: folderListKey() });
      },
    }),
  );
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.folders.delete.mutationOptions({
      onMutate: async (variables) => {
        const queryKey = folderListKey();
        await queryClient.cancelQueries({ queryKey });

        const previousData = queryClient.getQueriesData({ queryKey });

        queryClient.setQueriesData<Folder[]>({ queryKey }, (old) => {
          if (!old) return old;
          return old.filter((folder) => folder.id !== variables.id);
        });

        return { previousData };
      },
      onError: (error, _variables, context) => {
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
        queryClient.invalidateQueries({ queryKey: folderListKey() });
      },
    }),
  );
}

export function useCloneFolder() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.folders.clone.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: folderListKey() });
        toast.success("Folder cloned successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to clone folder");
      },
    }),
  );
}

export function useReorderFolders() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.folders.reorder.mutationOptions({
      onMutate: async (variables) => {
        const queryKey = folderListKey();
        await queryClient.cancelQueries({ queryKey });

        const previousData = queryClient.getQueriesData({ queryKey });

        const positionById = new Map(
          variables.orderedIds.map((id, i) => [id, i]),
        );

        queryClient.setQueriesData<Folder[]>({ queryKey }, (old) => {
          if (!old) return old;
          return [...old]
            .map((folder) => {
              const next = positionById.get(folder.id);
              return next === undefined
                ? folder
                : { ...folder, sortOrder: next };
            })
            .sort((a, b) => a.sortOrder - b.sortOrder);
        });

        return { previousData };
      },
      onError: (error, _variables, context) => {
        if (context?.previousData) {
          context.previousData.forEach(([key, data]) => {
            queryClient.setQueryData(key, data);
          });
        }
        toast.error(error.message || "Failed to reorder folders");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: folderListKey() });
      },
    }),
  );
}

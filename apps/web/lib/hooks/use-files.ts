import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";
import type { FileRecord } from "@/lib/types";

const fileListKey = () => orpc.files.find.key();

export function useFiles(folderId: string | null) {
  return useQuery(
    orpc.files.find.queryOptions({
      input: { folderId },
      staleTime: 30000,
    }),
  );
}

export function useSearchFiles(query: string, folderId: string | null) {
  return useQuery(
    orpc.files.search.queryOptions({
      input: { query, folderId },
      enabled: query.trim().length > 0,
      staleTime: 10000,
    }),
  );
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.files.upload.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: fileListKey() });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to upload file");
      },
    }),
  );
}

export function useRenameFile() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.files.rename.mutationOptions({
      onMutate: async (variables) => {
        const queryKey = fileListKey();
        await queryClient.cancelQueries({ queryKey });

        const previousData = queryClient.getQueriesData({ queryKey });

        queryClient.setQueriesData<FileRecord[]>({ queryKey }, (old) => {
          if (!old) return old;
          return old.map((file) =>
            file.id === variables.id
              ? { ...file, name: variables.name }
              : file,
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
        toast.error(error.message || "Failed to rename file");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: fileListKey() });
      },
    }),
  );
}

export function useChangeFileVisibility() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.files.changeVisibility.mutationOptions({
      onMutate: async (variables) => {
        const queryKey = fileListKey();
        await queryClient.cancelQueries({ queryKey });

        const previousData = queryClient.getQueriesData({ queryKey });

        queryClient.setQueriesData<FileRecord[]>({ queryKey }, (old) => {
          if (!old) return old;
          return old.map((file) =>
            file.id === variables.id
              ? { ...file, isPublic: variables.isPublic }
              : file,
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
        toast.error(error.message || "Failed to update file visibility");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: fileListKey() });
      },
    }),
  );
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.files.delete.mutationOptions({
      onMutate: async (variables) => {
        const queryKey = fileListKey();
        await queryClient.cancelQueries({ queryKey });

        const previousData = queryClient.getQueriesData({ queryKey });

        queryClient.setQueriesData<FileRecord[]>({ queryKey }, (old) => {
          if (!old) return old;
          return old.filter((file) => file.id !== variables.id);
        });

        return { previousData };
      },
      onError: (error, _variables, context) => {
        if (context?.previousData) {
          context.previousData.forEach(([key, data]) => {
            queryClient.setQueryData(key, data);
          });
        }
        toast.error(error.message || "Failed to delete file");
      },
      onSuccess: () => {
        toast.success("File deleted successfully");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: fileListKey() });
      },
    }),
  );
}

export function useCloneFile() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.files.clone.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: fileListKey() });
        toast.success("File cloned successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to clone file");
      },
    }),
  );
}

export function useReorderFiles() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.files.reorder.mutationOptions({
      onMutate: async (variables) => {
        const queryKey = fileListKey();
        await queryClient.cancelQueries({ queryKey });

        const previousData = queryClient.getQueriesData({ queryKey });

        const positionById = new Map(
          variables.orderedIds.map((id, i) => [id, i]),
        );

        queryClient.setQueriesData<FileRecord[]>({ queryKey }, (old) => {
          if (!old) return old;
          return [...old]
            .map((file) => {
              const next = positionById.get(file.id);
              return next === undefined
                ? file
                : { ...file, sortOrder: next };
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
        toast.error(error.message || "Failed to reorder files");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: fileListKey() });
      },
    }),
  );
}

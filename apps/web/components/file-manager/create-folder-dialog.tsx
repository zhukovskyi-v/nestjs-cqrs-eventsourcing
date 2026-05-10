"use client";

import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useCreateFolder, useUpdateFolder } from "@/lib/hooks/use-folders";
import type { Folder } from "@/lib/types";

const NAME_MAX_LENGTH = 255;

interface FolderFormValues {
  name: string;
}

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string | null;
  editingFolder: Folder | null;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  parentId,
  editingFolder,
}: CreateFolderDialogProps) {
  const isEditing = !!editingFolder;
  const createMutation = useCreateFolder();
  const updateMutation = useUpdateFolder();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FolderFormValues>({
    defaultValues: {
      name: "",
    },
  });

  const onSuccess = () => {
    onOpenChange(false);
    form.reset({ name: "" });
  };

  const onSubmit = useCallback(
    (values: FolderFormValues) => {
      const name = values.name.trim();

      if (isEditing && editingFolder) {
        updateMutation.mutate({ id: editingFolder.id, name }, { onSuccess });
        return;
      }

      createMutation.mutate(
        {
          name,
          parentFolderId: parentId,
        },
        { onSuccess },
      );
    },
    [parentId, editingFolder, onSuccess],
  );

  useEffect(() => {
    if (open) {
      form.reset({ name: editingFolder?.name ?? "" });
    }
  }, [open, editingFolder, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Folder" : "Create Folder"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="py-4">
              <FormField
                control={form.control}
                name="name"
                rules={{
                  validate: (value) =>
                    value.trim().length > 0 || "Name is required",
                  maxLength: {
                    value: NAME_MAX_LENGTH,
                    message: `Name must be ${NAME_MAX_LENGTH} characters or fewer`,
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Folder name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Folder name"
                        autoFocus
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

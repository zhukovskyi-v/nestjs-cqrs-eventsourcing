import { oc } from "@orpc/contract";
import { z } from "zod";

export const fileSchema = z.object({
  id: z.uuid(),
  name: z.string().max(255),
  ownerId: z.uuid(),
  folderId: z.uuid().nullable(),
  blobUrl: z.string(),
  blobPathname: z.string(),
  isPublic: z.boolean(),
  size: z.number().int().nullable(),
  contentType: z.string().nullable(),
  sortOrder: z.number().int(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type File = z.infer<typeof fileSchema>;

export const fileHistoryEntrySchema = z.object({
  eventType: z.string(),
  occurredOn: z.string(),
  summary: z.string(),
  payload: z.record(z.string(), z.unknown()),
});

export type FileHistoryEntry = z.infer<typeof fileHistoryEntrySchema>;

const idParam = z.object({ id: z.uuid() });

export const fileContract = {
  upload: oc
    .route({ method: "POST", path: "/files/upload" })
    .input(
      z.object({
        file: z.instanceof(File),
        folderId: z.uuid().nullable().optional(),
        // isPublic: z.boolean().optional(),
        name: z.string().min(1).max(255).optional(),
      }),
    )
    .output(fileSchema.pick({ id: true })),

  findOne: oc
    .route({ method: "GET", path: "/files/{id}" })
    .input(idParam)
    .output(fileSchema),

  find: oc
    .route({ method: "GET", path: "/files" })
    .input(
      z.object({
        folderId: z.uuid().nullable().optional(),
      }),
    )
    .output(z.array(fileSchema)),

  search: oc
    .route({ method: "GET", path: "/files/search" })
    .input(
      z.object({
        query: z.string().min(1),
        folderId: z.uuid().nullable().optional(),
      }),
    )
    .output(z.array(fileSchema)),

  rename: oc
    .route({
      method: "PATCH",
      path: "/files/{id}/rename",
      successStatus: 204,
    })
    .input(
      z.object({
        id: z.uuid(),
        name: z.string().min(1).max(255),
      }),
    )
    .output(z.void()),

  changeVisibility: oc
    .route({
      method: "PATCH",
      path: "/files/{id}/visibility",
      successStatus: 204,
    })
    .input(
      z.object({
        id: z.uuid(),
        isPublic: z.boolean(),
      }),
    )
    .output(z.void()),

  clone: oc
    .route({ method: "POST", path: "/files/{id}/clone" })
    .input(idParam)
    .output(z.object({ id: z.uuid() })),

  reorder: oc
    .route({ method: "PATCH", path: "/files/reorder", successStatus: 204 })
    .input(
      z.object({
        folderId: z.uuid().nullable(),
        orderedIds: z.array(z.uuid()).min(1),
      }),
    )
    .output(z.void()),

  delete: oc
    .route({ method: "DELETE", path: "/files/{id}", successStatus: 204 })
    .input(idParam)
    .output(z.void()),

  move: oc
    .route({ method: "PATCH", path: "/files/{id}/move", successStatus: 204 })
    .input(
      z.object({
        id: z.uuid(),
        folderId: z.uuid().nullable(),
      }),
    )
    .output(z.void()),

  getHistory: oc
    .route({ method: "GET", path: "/files/{id}/history" })
    .input(idParam)
    .output(z.array(fileHistoryEntrySchema)),
};

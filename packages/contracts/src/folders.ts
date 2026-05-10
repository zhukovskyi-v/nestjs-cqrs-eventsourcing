import { oc } from "@orpc/contract";
import { z } from "zod";

export const folderSchema = z.object({
  id: z.uuid(),
  name: z.string().max(255),
  ownerId: z.uuid(),
  parentFolderId: z.uuid().nullable(),
  sortOrder: z.number().int(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Folder = z.infer<typeof folderSchema>;

export const breadcrumbSchema = z.object({ id: z.uuid(), name: z.string() });

const idParam = z.object({ id: z.uuid() });

export const folderContract = {
  create: oc
    .route({ method: "POST", path: "/folders" })
    .input(
      z.object({
        name: z.string().min(1).max(255),
        parentFolderId: z.uuid().nullable().optional(),
      }),
    )
    .output(z.object({ id: z.uuid() })),

  findOne: oc
    .route({ method: "GET", path: "/folders/{id}" })
    .input(idParam)
    .output(folderSchema),

  find: oc
    .route({ method: "GET", path: "/folders" })
    .input(
      z.object({
        parentFolderId: z.uuid().nullable().optional(),
      }),
    )
    .output(z.array(folderSchema)),

  search: oc
    .route({ method: "GET", path: "/folders/search" })
    .input(
      z.object({
        query: z.string().min(1),
        parentFolderId: z.uuid().nullable().optional(),
      }),
    )
    .output(z.array(folderSchema)),

  getPath: oc
    .route({ method: "GET", path: "/folders/{id}/path" })
    .input(idParam)
    .output(z.array(breadcrumbSchema)),

  rename: oc
    .route({
      method: "PATCH",
      path: "/folders/{id}/rename",
      successStatus: 204,
    })
    .input(
      z.object({
        id: z.uuid(),
        name: z.string().min(1).max(255),
      }),
    )
    .output(z.void()),

  move: oc
    .route({ method: "PATCH", path: "/folders/{id}/move", successStatus: 204 })
    .input(
      z.object({
        id: z.uuid(),
        newParentFolderId: z.uuid().nullable().optional(),
      }),
    )
    .output(z.void()),

  clone: oc
    .route({ method: "POST", path: "/folders/{id}/clone" })
    .input(idParam)
    .output(z.object({ id: z.uuid() })),

  reorder: oc
    .route({ method: "PATCH", path: "/folders/reorder", successStatus: 204 })
    .input(
      z.object({
        parentFolderId: z.uuid().nullable(),
        orderedIds: z.array(z.uuid()).min(1),
      }),
    )
    .output(z.void()),

  delete: oc
    .route({ method: "DELETE", path: "/folders/{id}", successStatus: 204 })
    .input(idParam)
    .output(z.void()),
};

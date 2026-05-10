import { folderContract } from "./folders";

export const appContract = {
  folders: folderContract,
} as const;

export type AppContract = typeof appContract;

export { z } from "zod";
export * from "./folders";

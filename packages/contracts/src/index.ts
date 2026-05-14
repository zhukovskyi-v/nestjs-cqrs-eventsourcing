import { folderContract } from "./folders";
import { fileContract } from "./files";

export const appContract = {
  folders: folderContract,
  files: fileContract,
} as const;

export type AppContract = typeof appContract;

export { z } from "zod";
export * from "./folders";
export * from "./files";

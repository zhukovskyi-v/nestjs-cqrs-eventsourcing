import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ContractRouterClient } from "@orpc/contract";
import { appContract } from "@repo/contracts";

import { authClient } from "@/lib/auth/client";
import { JsonifiedClient } from "@orpc/openapi-client";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: () => queryClient.invalidateQueries(),
        },
      });
    },
  }),
});

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await authClient.getSession();

  const token = data?.session?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const link = new OpenAPILink(appContract, {
  url: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  fetch: (url, options) => fetch(url, { ...options, credentials: "include" }),
  headers: getAuthHeaders,
});

const client: JsonifiedClient<ContractRouterClient<typeof appContract>> =
  createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);

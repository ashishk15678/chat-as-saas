import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import superjson from "superjson";

export const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // avoids an immediate refetch after SSR hydration
        retry: (failures, err: any) =>
          err?.data?.httpStatus === 401 ? false : failures < 2,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (q) =>
          defaultShouldDehydrateQuery(q) || q.state.status === "pending",
      },
      hydrate: { deserializeData: superjson.deserialize },
    },
  });

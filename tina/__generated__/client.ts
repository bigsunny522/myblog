import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: 'a3d25d30faf453ad4816dcd048037c703b99d61a', queries,  });
export default client;
  
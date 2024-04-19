import { StackContext, Api, use } from "sst/constructs";
import { StorageStack } from './StorageStack';

export function ApiStack({ stack }: StackContext) {
  const { table } = use(StorageStack);
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [table],
      },
    },
    routes: {
      "POST /CreatePlaylist": "packages/functions/src/createPlaylist.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
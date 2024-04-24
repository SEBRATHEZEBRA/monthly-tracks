import { StackContext, Api, use, Config } from "sst/constructs";
import { StorageStack } from './StorageStack';

export function ApiStack({ stack }: StackContext) {
  const SPOTIFY_CLIENT_ID = new Config.Secret(stack, "SPOTIFY_CLIENT_ID");
  const SPOTIFY_CLIENT_SECRET = new Config.Secret(stack, "SPOTIFY_CLIENT_SECRET");
  const SPOTIFY_REFRESH_TOKEN = new Config.Secret(stack, "SPOTIFY_REFRESH_TOKEN");

  const { table } = use(StorageStack);
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN, table],
      },
    },
    routes: {
      "POST /": "packages/functions/src/createPlaylist.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
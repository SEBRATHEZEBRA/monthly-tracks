import { SSTConfig } from "sst";
import { Api, NextjsSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "monthly-tracks",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, "site");
      const api = new Api(stack, "api", {
        routes: {
          "GET /": "packages/functions/index.handler",
        }
      })

      stack.addOutputs({
        SiteUrl: site.url,
        ApiEndpoint: api.url
      });
    });
  },
} satisfies SSTConfig;

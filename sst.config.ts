import { SSTConfig } from "sst";
import { ApiStack } from "./stacks/ApiStack";
import { StorageStack } from './stacks/StorageStack';

export default {
  config(_input) {
    return {
      name: "monthly-tracks",
      region: "eu-west-2",
    };
  },
  stacks(app) {
    app.stack(StorageStack).stack(ApiStack);
  }
} satisfies SSTConfig;

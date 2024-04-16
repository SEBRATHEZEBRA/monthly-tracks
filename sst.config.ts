import { SSTConfig } from "sst";
import { API } from "./stacks/MyStack";

export default {
  config(_input) {
    return {
      name: "monthly-tracks",
      region: "eu-west-2",
    };
  },
  stacks(app) {
    app.stack(API);
  }
} satisfies SSTConfig;

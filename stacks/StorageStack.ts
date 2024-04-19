import { StackContext, Table } from "sst/constructs";

export function StorageStack({ stack }: StackContext) {
  // Create the DynamoDB table
  const table = new Table(stack, "users", {
    fields: {
      userId: "string",
      playlistId: "string",
    },
    primaryIndex: { partitionKey: "userId", sortKey: "playlistId" },
  });

  return {
    table,
  };
}
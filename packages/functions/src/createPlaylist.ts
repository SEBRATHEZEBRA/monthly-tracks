import { DynamoDBClient, PutItemCommand, PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Table } from "sst/node/table";

const client = new DynamoDBClient({});

const putItem = async (params: PutItemCommandInput) => {
  try {
    await client.send(new PutItemCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
  } catch (error) {
    let message;
    if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
};

export const handler = async(event: APIGatewayProxyEvent) => {
  let data, params, playlistName;

  if (event.body) {
    data = JSON.parse(event.body);
    playlistName = `${data.month}-${(data.year.slice(2) ?? new Date().getFullYear())}`;
    params = {
      TableName: Table.users.tableName,
      Item: {
        userId: { S: data.userId },
        playlistId: { S: playlistName },
        createdAt: { S: new Date().toISOString() },
      },
    };
    putItem(params);
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "No data provided" }),
    };
  }
};

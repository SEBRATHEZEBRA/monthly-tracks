import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent | Partial<APIGatewayProxyEvent>,
): Promise<APIGatewayProxyResult> => {
    return {
      statusCode: 200,
      body: `Hello World, I was triggered by ${event.httpMethod} method!`
    };
};

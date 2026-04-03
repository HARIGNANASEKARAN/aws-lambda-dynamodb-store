import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    // Get stage and path
    const stage = event.requestContext.stage; // e.g., "Dev"
    const path = event.rawPath.replace(`/${stage}`, ""); // strip stage
    const method = event.requestContext.http.method;

    // GET /Products
    if (path === '/Products' && method === 'GET') {
      const data = await db.send(new ScanCommand({ TableName: "Products" }));
      return {
        statusCode: 200,
        body: JSON.stringify(data.Items),
      };
    }

    // POST /Orders
    if (path === '/Orders' && method === 'POST') {
      // Support body being string or object
      const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

      // Validate payload
      if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Invalid order format: items must be a non-empty array" }),
        };
      }

      const order = {
        orderID: Date.now().toString(),
        items: body.items,
      };

      await db.send(new PutCommand({ TableName: "Orders", Item: order }));

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Order placed!" }),
      };
    }

    // Route not found
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Route not found" }),
    };

  } catch (err) {
    console.error("Lambda error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
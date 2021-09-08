import createProductSchema from "@functions/postProduct/createProductSchema";
import schema from "@functions/postProduct/createProductSchema";
import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import { Client } from "pg";
import { dbOptions } from "src/utils/dbOptions";

const postProduct: ValidatedEventAPIGatewayProxyEvent<
  typeof createProductSchema
> = async (event) => {
  console.log(`event`, event);

  const pgClient = new Client(dbOptions);
  try {
    const { title, description, price, count } = event.body;
    await pgClient.connect();
    await pgClient.query("BEGIN");

    const productDBResponse = await pgClient.query(
      `
        INSERT INTO products (title, description, price)
            VALUES ($1, $2, $3) RETURNING id;
      `,
      [title, description, price]
    );
    const productId = productDBResponse.rows[0].id;

    await pgClient.query(
      `
        INSERT INTO stocks (product_id, count)
            VALUES ($1, $2);
        `,
      [productId, count]
    );
    await pgClient.query("COMMIT");
    console.log(`COMMIT`);
    return formatJSONResponse(
      {
        success: true,
        productId: productId,
        error: null,
      },
      500
    );
  } catch (error) {
    await pgClient.query("ROLLBACK");
    console.log(`ROLLBACK`);
    console.error("Internal server error: ", error);
    return formatJSONResponse(
      {
        success: false,
        product: null,
        error: error.message,
      },
      500
    );
  } finally {
    pgClient.end();
  }
};

export const main = middyfy(postProduct);

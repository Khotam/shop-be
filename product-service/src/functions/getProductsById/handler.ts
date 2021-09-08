import "source-map-support/register";

import schema from "@functions/getProductsList/schema";
import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/apiGateway";
import { Client } from "pg";
import { middyfy } from "@libs/lambda";
import { dbOptions } from "src/utils/dbOptions";

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (event) => {
    console.log(`event`, event);

    const pgClient = new Client(dbOptions);

    try {
      const { productId } = event.pathParameters;
      await pgClient.connect();
      const query = {
        text: `SELECT p.*, s.count
                FROM products p
              INNER JOIN stocks s ON p.id = s.product_id
              WHERE p.id = $1;`,
        values: [productId],
      };
      const result = await pgClient.query(query);
      const product = result.rows[0];
      if (!product) {
        return formatJSONResponse(
          {
            success: false,
            product: null,
            error: "Not found",
          },
          404
        );
      }

      return formatJSONResponse(
        {
          success: true,
          product,
          error: null,
        },
        200
      );
    } catch (error) {
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

export const main = middyfy(getProductsById);

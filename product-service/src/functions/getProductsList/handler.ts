import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import { Client } from "pg";
import { dbOptions } from "src/utils/dbOptions";

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (event) => {
    console.log(`event`, event);

    const pgClient = new Client(dbOptions);
    try {
      await pgClient.connect();

      const result = await pgClient.query(`
        SELECT p.*, s.count
          FROM products p
        INNER JOIN stocks s ON p.id = s.product_id;`);
      const products = result.rows;
      return formatJSONResponse(
        {
          success: true,
          products,
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

export const main = middyfy(getProductsList);

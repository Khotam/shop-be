import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import { getProducts } from "src/utils/getProducts";

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (_) => {
    try {
      const products = await getProducts();
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
    }
  };

export const main = middyfy(getProductsList);

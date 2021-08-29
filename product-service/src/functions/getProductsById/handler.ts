import "source-map-support/register";

import schema from "@functions/getProductsList/schema";
import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import { getProducts } from "src/utils/getProducts";

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (event) => {
    try {
      const products = await getProducts();
      const { productId } = event.pathParameters;
      const product = products.filter((p) => p.id === Number(productId))[0];
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
    }
  };

export const main = middyfy(getProductsById);

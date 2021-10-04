import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import "source-map-support/register";
import { INTERNAL_SERVER_ERROR, OK } from "src/constants/responseCodes";
import { DbContext } from "src/db/dbConnect";
import { ProductService } from "src/services/product.service";
import { log } from "src/utils/logger";
import schema from "./schema";

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (event) => {
    log(event);

    try {
      const client = DbContext.getClient();
      await DbContext.connect();

      const productService = new ProductService();
      const products = await productService.getProductsAsync(client);
      return formatJSONResponse(
        {
          success: true,
          products,
          error: null,
        },
        OK
      );
    } catch (error) {
      console.error("Internal server error: ", error);
      return formatJSONResponse(
        {
          success: false,
          product: null,
          error: error.message,
        },
        INTERNAL_SERVER_ERROR
      );
    } finally {
      await DbContext.end();
    }
  };

export const main = middyfy(getProductsList);

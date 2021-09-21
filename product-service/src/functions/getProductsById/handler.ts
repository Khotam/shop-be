import schema from "@functions/getProductsList/schema";
import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import "source-map-support/register";
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "src/constants/responseCodes";
import { responseMessages } from "src/constants/responseMessages";
import { DbContext } from "src/db/dbConnect";
import { ProductService } from "src/services/product.service";
import { log } from "src/utils/logger";

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (event) => {
    log(event);

    try {
      const client = DbContext.getClient();
      const { productId } = event.pathParameters;
      await DbContext.connect();
      const productService = new ProductService();
      const product = await productService.getProductByIdAsync(
        client,
        productId
      );
      if (!product) {
        return formatJSONResponse(
          {
            success: false,
            product: null,
            error: responseMessages[NOT_FOUND],
          },
          NOT_FOUND
        );
      }

      return formatJSONResponse(
        {
          success: true,
          product,
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

export const main = middyfy(getProductsById);

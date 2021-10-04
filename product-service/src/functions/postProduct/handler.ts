import createProductSchema from "@functions/postProduct/createProductSchema";
import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import { INTERNAL_SERVER_ERROR, OK } from "src/constants/responseCodes";
import { DbContext } from "src/db/dbConnect";
import { ProductService } from "src/services/product.service";
import { log } from "src/utils/logger";

const postProduct: ValidatedEventAPIGatewayProxyEvent<
  typeof createProductSchema
> = async (event) => {
  log(event);

  try {
    const client = DbContext.getClient();
    await DbContext.connect();

    const { title, description, count, price } = event.body;

    const productService = new ProductService();
    const newProductId = await productService.addProduct(client, {
      title,
      count,
      price,
      description,
    });
    console.log(`COMMIT`);

    return formatJSONResponse(
      {
        success: true,
        productId: newProductId,
        error: null,
      },
      OK
    );
  } catch (error) {
    console.log(`ROLLBACK`);
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

export const main = middyfy(postProduct);

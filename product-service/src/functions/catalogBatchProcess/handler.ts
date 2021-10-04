import { middyfy } from "@libs/lambda";
import { SQSEvent } from "aws-lambda";
import { DbContext } from "src/db/dbConnect";
import { ProductService } from "src/services/product.service";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const catalogBatchProcess = async (event: SQSEvent) => {
  try {
    const sns = new SNSClient({ region: "eu-west-1" });
    const products = event.Records.map((record) => JSON.parse(record.body));

    const client = DbContext.getClient();
    await DbContext.connect();

    const productService = new ProductService();

    const productPromises = products.map((p) => {
      return productService.addProduct(client, p);
    });
    const result = await Promise.all(productPromises);
    console.log(
      `Successfully inserted ${result.length} records into database`,
      result
    );
    const IS_PREMIUM = products.find((p) => p.price >= 100);
    await sns.send(
      new PublishCommand({
        Subject: "Products added to the DB",
        Message: JSON.stringify(products),
        MessageAttributes: {
          product_type: {
            DataType: "String",
            StringValue: IS_PREMIUM ? "premium" : "normal",
          },
        },
        TopicArn: process.env.SNS_ARN,
      })
    );
    console.log(`Email sent`);
  } catch (error) {
    console.error("Error: ", error);
  } finally {
    await DbContext.end();
  }
};

export const main = middyfy(catalogBatchProcess);

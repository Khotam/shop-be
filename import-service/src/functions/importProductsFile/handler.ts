import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

import { INTERNAL_SERVER_ERROR, OK } from "src/constants/responseCodes";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof undefined> =
  async (event) => {
    const fileName = event.queryStringParameters.name;
    const catalogPath = `uploaded/${fileName}`;
    const s3Params = {
      Bucket: process.env.S3_BUCKET,
      Key: catalogPath,
      ContentType: "text/csv",
      // ACL: 'bucket-owner-full-control'
    };
    const s3 = new S3Client({ region: "eu-west-1" });
    const command = new PutObjectCommand(s3Params);

    try {
      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
      console.log("url", signedUrl);
      return formatJSONResponse(
        {
          url: signedUrl,
          error: null,
        },
        OK
      );
    } catch (error) {
      console.error("Error: ", error.message);
      return formatJSONResponse(
        {
          url: null,
          error: error.message,
        },
        INTERNAL_SERVER_ERROR
      );
    }
  };

export const main = middyfy(importProductsFile);

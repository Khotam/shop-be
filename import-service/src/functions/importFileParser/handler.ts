import {
  CopyObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import * as csvParser from "csv-parser";
import { INTERNAL_SERVER_ERROR } from "src/constants/responseCodes";

const { S3_BUCKET } = process.env;
const importFileParser = async (event) => {
  try {
    const s3 = new S3Client({ region: "eu-west-1" });

    for (const record of event.Records) {
      const { key } = record.s3.object;
      const s3Params = {
        Bucket: S3_BUCKET,
        Key: key,
      };
      const { Body } = await s3.send(new GetObjectCommand(s3Params));
      Body.pipe(csvParser())
        .on("data", (data) => {
          console.log(`data`, data);
        })
        .on("error", (error) => {
          console.error("Error[Stream]: ", error);
        })
        .on("end", async () => {
          console.log(`Copy from ${S3_BUCKET}/${key}`);
          await s3.send(
            new CopyObjectCommand({
              Bucket: S3_BUCKET,
              CopySource: `${S3_BUCKET}/${key}`,
              Key: key.replace("uploaded", "parsed"),
            })
          );
          console.log(
            `Copied into ${S3_BUCKET}/${key.replace("uploaded", "parsed")}`
          );

          console.log(`Stream ended`);
        });
    }
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

export const main = middyfy(importFileParser);

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import * as csvParser from "csv-parser";
import { INTERNAL_SERVER_ERROR } from "src/constants/responseCodes";

const { S3_BUCKET } = process.env;
const importFileParser = async (event) => {
  const s3 = new S3Client({ region: "eu-west-1" });

  for (const record of event.Records) {
    const { key } = record.s3.object;
    console.log(`key`, key);
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
        console.log(`key`, key);
        console.error("Error[Stream]: ", error.message);
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
        await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
        console.log(`Deleted from ${S3_BUCKET}/${key}`);
        console.log(`Stream ended`);
      });
  }
};

export const main = middyfy(importFileParser);

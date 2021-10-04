import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { middyfy } from "@libs/lambda";
import * as csvParser from "csv-parser";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const { S3_BUCKET } = process.env;

const importFileParser = async (event) => {
  const s3 = new S3Client({ region: "eu-west-1" });
  const sqs = new SQSClient({ region: "eu-west-1" });

  for (const record of event.Records) {
    const { key } = record.s3.object;
    const s3Params = {
      Bucket: S3_BUCKET,
      Key: key,
    };
    const sqsParams = (data) => ({
      MessageBody: JSON.stringify(data),
      QueueUrl: process.env.SQS_URL,
    });

    const { Body } = await s3.send(new GetObjectCommand(s3Params));
    //////////
    Body.pipe(csvParser())
      .on("data", async (data) => {
        console.log(`data`, data);
        await sqs.send(new SendMessageCommand(sqsParams(data)));
      })
      .on("error", (error) => {
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

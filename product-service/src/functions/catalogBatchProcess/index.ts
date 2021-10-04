// import schema from "./schema";
import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sqs: {
        batchSize: 5,
        maximumBatchingWindow: 10,
        arn: {
          "Fn::ImportValue": "sqs-queue-task6-arn",
        },
      },
    },
  ],
};

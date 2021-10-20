import "source-map-support/register";

import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import { generatePolicy } from "@libs/generatePolicy";

const basicAuthorizer = async (event, ctx, cb) => {
  if (event["type"] !== "TOKEN") {
    cb("Unauthorized");
  }

  try {
    const authToken = event.authorizationToken;
    const encodedCreds = authToken.split(" ")[1];
    const buff = Buffer.from(encodedCreds, "base64");
    const [username, password] = buff.toString("utf-8").split(":"); // [username, password]

    const storedUserPassword = process.env[username];

    const effect =
      !storedUserPassword || storedUserPassword !== password ? "Deny" : "Allow";

    const policy = generatePolicy(encodedCreds, effect, event.methodArn);
    cb(null, policy);
  } catch (error) {
    console.error("Error: ", error);
    cb(`Unauthorized ${error.message}`);
  }
};

export const main = middyfy(basicAuthorizer);

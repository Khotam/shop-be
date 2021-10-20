import type { AWS } from "@serverless/typescript";

import importProductsFile from "@functions/importProductsFile";
import importFileParser from "@functions/importFileParser";

const serverlessConfiguration: AWS = {
  service: "import-service",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
    authorizerArn: {
      "Fn::ImportValue": "basicAuthorizerArn",
    },
  },
  useDotenv: true,
  plugins: ["serverless-webpack"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-west-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      S3_BUCKET: "${env:S3_BUCKET}",
      SQS_URL: {
        Ref: "SQSQueue",
      },
    },
    lambdaHashingVersion: "20201221",
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "s3:ListBucket",
        Resource: "arn:aws:s3:::nodeaws-task5-bucket",
      },
      {
        Effect: "Allow",
        Action: "s3:*",
        Resource: "arn:aws:s3:::nodeaws-task5-bucket/*",
      },
      {
        Effect: "Allow",
        Action: "sqs:*",
        Resource: {
          "Fn::GetAtt": ["SQSQueue", "Arn"],
        },
      },
    ],
  },
  // import the function via paths
  functions: {
    importProductsFile,
    importFileParser: importFileParser as any,
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "catalogItemsQueue",
        },
      },
      GatewayResponseDefault4XX: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
          },
          ResponseType: "DEFAULT_4XX",
          RestApiId: {
            Ref: "ApiGatewayRestApi",
          },
        },
      },
      GatewayResponseDefault5XX: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
          },
          ResponseType: "DEFAULT_5XX",
          RestApiId: {
            Ref: "ApiGatewayRestApi",
          },
        },
      },
    },
    Outputs: {
      SQSQueueArn: {
        Description:
          "sqs queue for inserting parsed csv file products into RDS",
        Value: {
          "Fn::GetAtt": ["SQSQueue", "Arn"],
        },
        Export: {
          Name: "sqs-queue-task6-arn",
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;

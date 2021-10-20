import type { AWS } from "@serverless/typescript";

import basicAuthorizer from "@functions/basicAuthorizer";

const serverlessConfiguration: AWS = {
  service: "authorization-service",
  frameworkVersion: "2",
  useDotenv: true,
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
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
      Khotam: "${env:Khotam}",
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
    lambdaHashingVersion: "20201221",
  },
  // import the function via paths
  functions: { basicAuthorizer },
  resources: {
    Outputs: {
      basicAuthorizerArn: {
        Description: "token authorizer function",
        Value: {
          "Fn::GetAtt": ["BasicAuthorizerLambdaFunction", "Arn"],
        },
        Export: {
          Name: "basicAuthorizerArn",
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;

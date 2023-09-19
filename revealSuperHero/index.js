import middy from '@middy/core';
import errorLoggerMiddleware from '@middy/error-logger';
import inputOutputLoggerMiddleware from '@middy/input-output-logger';
import httpErrorHandlerMiddleware from '@middy/http-error-handler';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function getSuperHero(userId) {
    console.log(`Getting all details for user ${userId}`);

    const queryInformation = new QueryCommand({
            TableName: process.env.DynamodbTableName,
            Select: "ALL_ATTRIBUTES",
            ExpressionAttributeNames: {
                "#a": "PK"
            },
            ExpressionAttributeValues: {
                ":v1": `USER#${userId}`
            },
            KeyConditionExpression: "#a = :v1"
        }
    );
    const response = await docClient.send(queryInformation)
    return response["Items"];
}

const revealSuperHeroHandler = async (event, context) => {
    const userId = event['pathParameters']['userId']
    return await getSuperHero(userId);
}

export const handler = middy({
    timeoutEarlyResponse: () => {
        return {
            statusCode: 408
        }
    }
}).use(inputOutputLoggerMiddleware())
    .use(errorLoggerMiddleware())
    .use(httpJsonBodyParser())
    .use(httpErrorHandlerMiddleware()
    ).handler(revealSuperHeroHandler)
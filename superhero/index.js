import middy from '@middy/core';
import errorLoggerMiddleware from '@middy/error-logger';
import inputOutputLoggerMiddleware from '@middy/input-output-logger';
import httpErrorHandlerMiddleware from '@middy/http-error-handler';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const schema = {
    type: 'object',
    required: ['body'],
    properties: {
        body: {
            type: 'object',
            required: ['superheroScore'],
            properties: {
                superheroScore: { type: 'number', maximum: 100,  minimum: 0}
            },
        },
    }
}

const superheroHandler = async (event, context, {signal}) => {
    let superheroScore = event.body.superheroScore;
    let userId = event.requestContext.authorizer.lambda.userId;

    const dbPutAction = new PutCommand({
        TableName: process.env.DynamodbTableName,
        Item: {
            PK: `USER#${userId}`,
            SK: `superhero#score`,
            score: superheroScore
        }
    });
    const response = await docClient.send(dbPutAction);
    return {
        reference: userId,
        url: `/reveal-superhero/${userId}`
    }
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
    .use(httpErrorHandlerMiddleware())
    .use(
        validator({
            eventSchema: transpileSchema(schema)
        })
    ).handler(superheroHandler)

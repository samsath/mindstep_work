import {v4 as uuidv4} from 'uuid';
import middy from '@middy/core';
import errorLoggerMiddleware from '@middy/error-logger';
import inputOutputLoggerMiddleware from '@middy/input-output-logger';
import httpErrorHandlerMiddleware from '@middy/http-error-handler';

const authHanlder = (event, context) => {
    /**
     * This is to fake a basic authentication function so each request coming into the
     * api gateway will be randomly assigned a User ID.
     * If needing to lock it down can use this to get a tokens or other values from the requests
     * and do the correct checks.
     */
    let userId = uuidv4();
    return {
        isAuthorized: true,
        context: {
            "userId": userId
        }
    };
}

export const handler = middy()
    .use(inputOutputLoggerMiddleware())
    .use(errorLoggerMiddleware())
    .use(httpErrorHandlerMiddleware())
    .handler(authHanlder)

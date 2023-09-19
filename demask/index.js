import middy from '@middy/core';
import errorLoggerMiddleware from '@middy/error-logger';
import inputOutputLoggerMiddleware from '@middy/input-output-logger';
import httpErrorHandlerMiddleware from '@middy/http-error-handler';

import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand} from "@aws-sdk/lib-dynamodb";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import {toCSVFormat, CSVtoJson, normalize, invisibleStatus} from "./util.js";


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const s3Client = new S3Client({});


async function getPersonDetails() {
    console.log("Request Person details");
    const response = await fetch('https://randomuser.me/api/');
    if (!response.ok) {
        console.error(`HTTP error ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results[0];
}

export function invisibleScore(gender, age, score) {
    /**
     * As the age of someone is a variable an always positive so
     * going to use that as a marker to work out what the largest and
     * smallest possible values could be.
     * Once we have that gauge we can use that to convert the score
     * they gave us into the 0 to 100 range.
     */
    const MALE_WEIGHTING = parseInt(process.env.MALE_WEIGHTING);
    const FEMALE_WEIGHTING = parseInt(process.env.FEMALE_WEIGHTING);

    const weighting = ((gender === "female") ? FEMALE_WEIGHTING : MALE_WEIGHTING);

    const possibleMinScore = 0;
    const possibleMaxScore = 100;
    const minValue = weighting * (possibleMinScore - age);
    const maxValue = weighting * (possibleMaxScore - age);
    const value = weighting * (score - age);

    return normalize(value, minValue, maxValue, 0, 100);
}

async function updateInvisible(userId, person) {
    /**
     * Put the Individuals invisible status into the Dynamodb table.
     */
    console.log(`Saving Invisible status of user "${userId}"`);

    const putInvisibleStatus =  new PutCommand({
        TableName: process.env.DynamodbTableName,
        Item: {
            PK: userId,
            SK: 'superhero#invisible',
            level: person["invisible"]["level"],
            status: person["invisible"]["status"]
        }
    });
    return await docClient.send(putInvisibleStatus);

}

async function updatePerson(userId, personFlat) {
    /**
     * Put the Individuals full information into the DynamoDB table,
     * so that we can call the endpoint and get everything about them
     * back in one go.
     *
     * Including the invisible status and score as we using the same CSV
     * data it is a duplication by for this purpose it dooesn't need removing.
     */
    console.log(`Saving personal details of user "${userId}"`);
    const flatPerson = CSVtoJson(personFlat)
    let result = [];
    for (const record of flatPerson) {
       record["PK"] = userId;
       record["SK"] = "superhero#person";

        const putPersonInformation = new PutCommand({
            TableName: process.env.DynamodbTableName,
            Item: record
        });
        const recordResult = await docClient.send(putPersonInformation);
        result.push(recordResult);
    }

    return result;
}


async function saveToS3(userId, flattenPerson) {
    /**
     * Save the generated CSV data into a s3 bucket
     */
    console.log(`Saving user "${userId}" to S3 as CSV`);
    const user = userId.split("#");
    const command = new PutObjectCommand({
        Bucket: process.env.SUPERHEROBUCKET,
        Key: `${user[1]}.csv`,
        Body: flattenPerson,
    });

    try {
        const response = await s3Client.send(command);
        console.log(response);
        return response;
    } catch (err) {
        console.error(err);
    }
}

const recordProcess = (event) => {
    /**
     * This is the main record processing workflow, based on call backs to different services.
     * Will be triggered by a Dynamodb stream update ok an item with a certain SK.
     *
     * Will go through the chain each time doing some data processing, using callback and not
     * awaits as it is more clear on that it is a long chain and each process passes something
     * onto the next one.
     */
    console.log(`recordProcess for event`, event);

    return new Promise((resolve, reject) => {
        const newImage = event.dynamodb.NewImage;
        if (newImage) {
            const userId = newImage.PK.S;
            const score = newImage.score.N;

            getPersonDetails()
                .then(person => {
                    const invisibleNumber = invisibleScore(person['gender'], person['dob']['age'], score);
                    const invisibleStatusResult = invisibleStatus(invisibleNumber);
                    person.invisible = {};
                    person.invisible.level = invisibleNumber;
                    person.invisible.status = invisibleStatusResult;
                    person.superhero = score;
                    return {userId, person};
                })
                .then(({userId, person}) => {
                    return updateInvisible(userId, person).then(() => ({userId, person})); // Return userId and person for next then
                })
                .then(({userId, person}) => {
                    const flattenPerson = toCSVFormat(person);
                    return updatePerson(userId, flattenPerson).then(() => ({userId, flattenPerson})); // Return these for next then
                })
                .then(({userId, flattenPerson}) => {
                    saveToS3(userId, flattenPerson)
                        .then(() => resolve())
                        .catch(error => reject(error)); // Reject the promise if there's an error
                })
                .catch(error => {
                    console.error("Error", error);
                    reject(error); // Reject the promise if there's an error
                });
        } else {
            console.log("Payload from DynamoDB stream didn't have 'New Image' attribute.");
            resolve();
        }
    });
}

const demaskHandler = async (event, context, {signal}) => {
    return Promise.all(event.Records.map(recordProcess)).then(responses => {
        return {
            "statusCode": 200
        };
    }).catch((reason) => {
        return {
            "statusCode": 500
        }
    });
}

export const handler = middy()
    .use(inputOutputLoggerMiddleware())
    .use(errorLoggerMiddleware())
    .use(httpErrorHandlerMiddleware())
    .handler(demaskHandler)
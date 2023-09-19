# Sam Hipwell's Mindstep task

Uses Serverless framework with Dynamodb as the main event routing system.

## Folder Structure:

**serverless.yml** -> All the function configuration and Cloudformation setting sits.

**superhero** -> The lambda which takes the API gateway request and saves it to DynamoDB

**fakeAuthoriser** -> The lambda which does pretend authorisation

**demask** -> Is the lambda which does the SuperHero and person processing which updates DynamoDB and save CSV to S3.

**revealSuperHero** -> This endpoint takes the reference from superhero endpoint and returns all the DynamoDB data for that User. In raw json format no filtering.


## Endpoints
Currently deployed to AWS with the endpoints

POST - https://1inkb86cnb.execute-api.eu-west-1.amazonaws.com/superhero

GET - https://1inkb86cnb.execute-api.eu-west-1.amazonaws.com/reveal-superhero/{userId}

Post Superhero payload:
```json
{
    "superheroScore": 66
}
```

Response 
```json
{
    "reference": "1dbdded7-6156-46f3-9e76-6cf19841c029",
    "url": "/reveal-superhero/1dbdded7-6156-46f3-9e76-6cf19841c029"
}
```

Reference is the UserId for the request and the URL is the endpoint where you can
see the full content once it is generated.

## Commands

Build
```bash
npm ci
```

Run tests:
```bash
npm run test
```

To Deploy you need to run this command with an AWS profile with correct pemissions.
```bash
npm run deploy-dev
```
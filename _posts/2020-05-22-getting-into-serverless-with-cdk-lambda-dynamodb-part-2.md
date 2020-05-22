---
layout: post
title: Getting into Serverless with CDK, Lambda & DynamoDB - Part 2
categories: aws cdk
comments: true
excerpt: |
  In this second post, we are going to add a DynamoDB Table to
  our stack for our lambda function to pull data from.
---

In this second post, we are going to add a DynamoDB Table to our stack for our lambda function to pull data from. See [Part 1](https://almcc.me/blog/2020/04/21/getting-into-serverless-with-cdk-lambda-dynamodb-part-1/) on getting started to get caught up.

Before we go too far, you are going to need:

- Python 3.8 with Pip installed
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

## Step 1 - Defining the table.

Install the DynamoDB CDK module, being careful to use the same release you used before.

```bash
npm install @aws-cdk/aws-dynamodb@1.33.1
```

And add it to our imports in `lib/myapp-stack.ts`.

```
import * as dynamodb from "@aws-cdk/aws-dynamodb";
```

Next, we can add a DynamoDB [Table](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-dynamodb.Table.html) construct to our stack. DynamoDB is a no-sql database and requires you to think a little bit about how your data will be accessed. Read about the key concepts over [here](https://www.dynamodbguide.com/key-concepts/) on [dynamodbguide.com](https://www.dynamodbguide.com/)

```tsx
const tourfinishersTable = new dynamodb.Table(this, "TourFinishersTable", {
  partitionKey: { name: "Year", type: dynamodb.AttributeType.NUMBER },
  sortKey: { name: "Position", type: dynamodb.AttributeType.NUMBER },
  tableName: "TourFinishers",
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});
```

We have chosen in this instance to make the `Year` the primary key and `Position` the sort key, together this will be a unique value within this simple context a high cardinality. It will support our access pattern later as will.

Next step is to grant our function read access to the table.

```tsx
tourfinishersTable.grantReadData(myFunction);
```

I think this is one of the most powerful features of CDK, it makes dealing with permissions so easy that you don't feel the need to grant overly permissive policies.

## Step 2 - Updating out function

Our python function is going to be a little more complex than before and will require some dependencies. Therefore we first need to move it into its own `src` directory.

```bash
mkdir function/src
mv function/index.py function/src/
```

Next, we will want to add a requreiments.txt file at `function/src/requirements.txt` and add the following dependencies.

```bash
boto3>=1.12.43
```

Now we will write a `build.sh` script at the base of our project to build are code bundle. AWS Lambda's require a code bundle to come pre-packaged with all its dependencies.

```makefile
#!/bin/bash

mkdir -p function/_bundle
pip3.8 install -r function/src/requirements.txt --target function/_bundle
cp -r function/src/* function/_bundle
pushd function/_bundle
zip -r --quiet ../bundle.zip .
popd
rm -rf function/_bundle
```

And now we can update our code `function/src/index.py` to pull the data from dynamoDB.

```bash
import boto3
from boto3.dynamodb.conditions import Key

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TourFinishers')

def main(event, context):
    logger.info("Start of function")

    response = table.query(
        KeyConditionExpression=Key('Year').eq(2019)
    )

    return {
        "statusCode": 200,
        "body": response["Items"],
        "headers": {
            "Content-Type": "application/json"
        }
    }
```

Next, we run `./build.sh` to build are bundle and then we can point CDK at our code bundle by updating the `code` property of our lambda in `lib/myapp-stack.ts`.

```tsx
code: lambda.Code.fromAsset(
  path.join(__dirname, "../function/bundle.zip")
),
```

## Step 3 - Deploy the changes

Simply build and deploy are changes to AWS.

```tsx
npm run build
cdk deploy
```

To speed things along for this demo, I have a gist that has the top 3 winners of the last 3 Tours that we can import into our table in AWS directly.

```tsx
aws dynamodb batch-write-item --request-items https://gist.githubusercontent.com/almcc/1437d07e5f344bb8a5b03376a9473af2/raw/a96c545774c5a046b8e7b32e597ded0f7a84306c/TourFinishers.json
```

## Step 4 - Execute to lambda

Now to run your function in AWS we can use the AWS command.

```bash
aws lambda invoke --function-name MyappStack-MyFunction3BAA72D1-1H78B5LRDK3NI >(cat | jq) --log-type Tail | jq --raw-output .LogResult | base64 -d
```

You should see something a bit like this as the output.

```json
{
  "statusCode": 200,
  "body": [
    {
      "RiderNumber": 2,
      "Position": 1,
      "FirstName": "Egan",
      "LastName": "Bernal",
      "TeamName": "Team INEOS",
      "Year": 2019
    },
    {
      "RiderNumber": 1,
      "Position": 2,
      "FirstName": "Geraint",
      "LastName": "Thomas",
      "TeamName": "Team INEOS",
      "Year": 2019
    },
    {
      "RiderNumber": 81,
      "Position": 3,
      "FirstName": "Steven",
      "LastName": "Kruijswijk",
      "TeamName": "Team Jumbo-Visma",
      "Year": 2019
    }
  ],
  "headers": {
    "Content-Type": "application/json"
  }
}
...
```

## Bonus Step - Running the function locally

You can also run the function locally with the AWS sam CLI which can be handy during development.

The first thing to do is to get hold of the CloudFormation template that CDK is creating behind the scenes for us.

```bash
cdk synth --no-staging > template.yaml
```

Now you can use the `sam` CLI to invoke your function. (Check the contents of `template.yaml` for the functions name)

```bash
sam local invoke MyFunction3BAA72D1 --no-event | jq
```

This will run your code locally, using your local credentials to query the live table in AWS.

Then if you make any changes to you code you will need to run `./build.sh` again, if you make a change to your template, you will need to do the following.

```bash
npm run build
cdk synth --no-staging > template.yaml
```

## Job done!

That's it for this post, Next time we will look at adding the API gateway.

If you would like to clean up everything you have created in AWS, see Step 6 - _Cleaning up_ from the [first post in this series](https://almcc.me/blog/2020/04/21/getting-into-serverless-with-cdk-lambda-dynamodb-part-1/).

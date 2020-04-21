---
layout: post
title: Getting into Serverless with CDK, Lambda & DynamoDB - Part 1
categories: aws cdk
comments: true
excerpt: |
  AWS Cloud Development Kit (CDK) is a great tool for using 
  code to deploy resources to AWS.
---

AWS Cloud Development Kit (CDK) is a great tool for using code to deploy resources to AWS. In a series of posts, we will cover a few of the key concepts you need to be aware of getting started with AWS and CDK. We will create a Lambda Function that returns some data from a DynamoDB table over an API Gateway.

CDK allows you to define [Constructs](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html) in code that map to AWS components or resources, you can then collect those Constructs together into a [Stack](https://docs.aws.amazon.com/cdk/latest/guide/stacks.html) which is what we deploy to an AWS region. Finally, a Stack is defined within an [App](https://docs.aws.amazon.com/cdk/latest/guide/apps.html) which is the root of our project, it can contain many instances of the same stack for say multiple regions or multiple different stack instances.

You can choose to develop CDK projects with TypeScipt, JavaScript, Python Java or C#. While initially learning CDK I went for Python as it is usually my language of choice, I have later found TypeScript to be much more comfortable as there is a wealth of examples already out there. We will use TypeScript for this post.

**Note:** Many tutorials and guides on learning AWS will suggest using the web console to setup and configure resources, however, beyond simple examples I have felt uncomfortable building so much in an unrepeatable fashion. If you are someone who learns by doing, then a pattern I have found works really well is building a setup partially with CDK, then using the web console to learn and experiment further before refactoring those changes back into the CDK stack itself. Simply rinse and repeat to develop ever bigger or more bespoke setups. Having AWS best practice built into the CDK constructs is a comforting safety net.

So that is already too many words, let's get started.

## Prerequisites

- You have the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) installed and configured, this post was created using V1 of the CLI however both V1 and V2 should work. The `aws configure list` command is a good way to test if you have your credentials set up correctly. For those of you who use profiles with the `--profile` flag, the `cdk` command works in the same way,

## Step 1, Install the CDK CLI.

Assuming you have [node](https://nodejs.org/en/) already installed, you just now need TypeScript and the CDK CLI

```bash
npm install -g typescript
npm install -g aws-cdk
```

## Step 2, Create our project.

Let's make a directory and initialise a typescript app project.

```bash
mkdir myapp
cd myapp/
cdk init app --language typescript
```

And a quick test that it builds ok.

```bash
npm run build
```

## Step 3, The Lambda Function

Install the lambda package.

```bash
npm install @aws-cdk/aws-lambda
```

Add the dependency to our stack (`lib/myapp-stack.ts`).

```typescript
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

export class MyappStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
  }
}
```

Next, we need to write some function lambda code. Create a file inside a newly created function directory (`function/index.py`). In this case, we are just going to return the last 3 winners of the Tour de France, later we will work on returning their names from a DynamoDB table.

```python
import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def main(event, context):
    logger.info("Start of function")
    return {
        "statusCode": 200,
        "body": ["Egan Bernal", "Geraint Thomas", "Chris Froome"],
        "headers": {
            "Content-Type": "application/json"
        }
    }
```

Notice that I have also set up a logger with a simple logging statement, this will be useful later to demonstrate how we retrieve those logs.

Now we need to define our lambda function in our stack, [we can use the `Function` construct from the `aws-lambda` package.](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-lambda.Function.html) Inside the `MyappStack` construct in `lib/myapp-stack.ts` add the following code.

```typescript
const myFunction = new lambda.Function(this, "MyFunction", {
  runtime: lambda.Runtime.PYTHON_3_8,
  handler: "index.main",
  code: lambda.Code.fromAsset(path.join(__dirname, "../function")),
});
```

Don't forget to add `import * as path from "path";` as well.

You can see that I have defined a function imaginatively named `MyFunction`, it uses the Python 3.8 runtime, it's handler points to `main` function inside the `[index.py](http://index.py)` module and finally, the code lives in the `function` directory which is in the parent directory to our `lib` directory.

As it stands, this is enough for us to deploy our code. However, to invoke our function later we are going to need the function name that is created. CDK will take our `MyFunction` name and [add's to it to make sure that it's unique](https://docs.aws.amazon.com/cdk/latest/guide/identifiers.html). To extract that name of the function that will be created in AWS we can add a CloudFormation Output to our stack.

Again in `lib/myapp-stack.ts` and the following code under our lambda function declaration.

```typescript
new cdk.CfnOutput(this, "FunctionNameOutput", {
  value: myFunction.functionName,
  exportName: "Lambda-Function-Name",
});
```

Note here that the `exportName` is the identifier for how we will reference the value and it **must** be unique across your entire AWS account, regardless of the stack. You can also see the reason we defined our function to a variable.

## Step 4, Build and Deploy

Let's quickly check that our project builds.

```bash
npm run build
```

We can also check that CDK can successfully convert (or synthesise) are code into a CloudFormation template.

```bash
cdk synth
```

I tend to pipe the output of `cdk synth` to less as output is long and it's useful to have a way to search it.

```
cdk synth | less
```

If all that worked then we are almost good to go. If this is the first time out have deployed a CDK project to your aws account you will need to [bootstrap you account](https://docs.aws.amazon.com/cdk/latest/guide/tools.html).

```bash
cdk bootstrap
```

Now we are ready to deploy our stack.

```bash
cdk deploy
```

You will be asked to approve any IAM policies and statements that CDK is creating. This is also a good insight into how policies are stitched together in AWS as well as a good reminder of the heavy lifting that CDK is doing for you.

When making changes to your project and deploying again, it can be useful to chain the build command and the deploy command together to avoid deploying a stale stack without your changes and then scratching your head as to why you change didn't work.

```bash
npm run build && cdk deploy
```

As I have used `&&`, `cdk deploy` will only run if the previous command (the build command) succeeds.

## Step 5, Invoking our Function

In the output of the deploy command, you should see our CloudFormation Output. It will look a little like the following:

```
Outputs:
MyappStack.FunctionNameOutput = MyappStack-MyFunction3BAA72D1-173G8DYDM9QA7
```

This is a function that we are now ready to invoke. We can do this with the `aws lambda invoke` command.

```bash
aws lambda invoke --function-name MyappStack-MyFunction3BAA72D1-173G8DYDM9QA7 out.txt
```

This will invoke our function and push the output to `out.txt` which should look like this.

```
{"statusCode": 200, "body": ["Egan Bernal", "Geraint Thomas", "Chris Froome"], "headers": {"Content-Type": "application/json"}}
```

If you also want to see the logging output you can use the `--log-type Tail` option and it will include the LogResult in the function invocation response that was printed to the terminal.

```bash
aws lambda invoke --function-name MyappStack-MyFunction3BAA72D1-173G8DYDM9QA7 out.txt --log-type Tail
```

Unfortunately, this will be in base64. You can paste it into your favourite base64 decoder to view the logs. For example, you could use the `base64` command.

```bash
echo <insert-base64-content-here> | base64 -d
```

You should get some output that looks a little like this:

```
START RequestId: 1fc4012a-3963-449b-8085-347e0a12e961 Version: $LATEST
[INFO]  2020-04-21T05:47:14.519Z        1fc4012a-3963-449b-8085-347e0a12e961    Start of function
END RequestId: 1fc4012a-3963-449b-8085-347e0a12e961
REPORT RequestId: 1fc4012a-3963-449b-8085-347e0a12e961  Duration: 1.15 ms       Billed Duration: 100 ms Memory Size: 128 MB     Max Memory Used: 49 MB
```

**Warning:** Below I get a little sidetracked with command line tricks, if you are not a fan of the one-liner bash commands please feel free to skip ahead, otherwise make sure you have the `jq` command installed and read on!

We could also use some `jq` trickery to do that on the command line with the `base64` command.

```bash
aws lambda invoke --function-name MyappStack-MyFunction3BAA72D1-173G8DYDM9QA7 out.txt --log-type Tail | jq --raw-output .LogResult | base64 -d
```

While we are at it, it can be cumbersome to always be having to peek inside the `out.txt` file to see the output. We can avoid creating that file all together with the use of a process substitution that will work in most shells. We can also use `jq` again to clean up the output. We simply replace `out.txt` with `>(cat | jq)`.

```bash
aws lambda invoke --function-name MyappStack-MyFunction3BAA72D1-173G8DYDM9QA7 >(cat | jq) --log-type Tail | jq --raw-output .LogResult | base64 -d
```

You should now see the output of your lambda function printed cleanly to the terminal followed by any logging.

Finally, while we are down this rabbit hole, could we pull out the function name from CloudFormation programmatically so that you can just copy and paste the command? Well, yes we could.

```bash
aws lambda invoke --function-name $(aws cloudformation list-exports --query 'Exports[?Name==`Lambda-Function-Name`].Value' --output text) >(cat | jq) --log-type Tail | jq --raw-output .LogResult | base64 -d
```

## Step 6, Cleaning up

We have covered quite a bit there already and your at the point where you can experiment further on your own. In the next post, we will look at building a DynamoDB table and querying our data.

You could choose to leave your stack in place, AWS gives you 1 Million free lambda invocations per month and the S3 Bucket created by CDK will be free if your account is less than 12 months old.

However, if you would like to destroy your stack you can do the following.

```bash
cdk destroy
```

And if you would like to remove the CDKToolkit stack you will need to use the `aws` command to get the name of the cdk bucket (or use the web console)

```bash
aws s3 ls
```

You can then empty the bucket and delete the stack.

```bash
aws s3 rm s3://cdktoolkit-stagingbucket-19rslbj9gvcos --recursive
aws cloudformation delete-stack --stack-name CDKToolkit
```

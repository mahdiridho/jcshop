## Introduction

Appycloud provides a way to setup AWS infrastructure for serverless applications. Once logged into appycloud, you can create various different types of serverless applications. Once created this repository will provide you with a headstart on implementing your code for your Lambda function.

This repo provides the Lambda code in the function directory. Update this code as required.
The repo also provides a test harness (in the directory testHarness). You can run the testFunction.js script to download your data from the cloud and it allows you to develop your function locally using real data.

## Deployment
The backend system is already deployed on appycloud platform. This repo is to update the function code only, run the command below to update the function code:

1. setup variables in the config.json, you can run inital-setup.sh to help.

2. run this command :

```
./update-function-code.sh [prefix] [region] [aws_profile]
```

## Test Harness

1. setup variables in the config.json, you can run inital-setup.sh to help.

2. cd testHarness then;

```
testHarness$ ./testFunction.js
```

The test will do these:
1. populate the list of items on dynamodb table (max 100 items)
2. generate event records
3. run function handler
4. processing the records

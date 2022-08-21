"use strict";
let AWS = require('aws-sdk');
let CustomCode = require('./class/CustomCode').CustomCode;
const ExecutionMode = require('./ExecutionMode').ExecutionMode;
let executionMode = new ExecutionMode(require('./config.json'));
if (executionMode.runningLocally) {
  console.log('Testing locally.');
  AWS.config.update({
    region: executionMode.region,
    credentials: new AWS.SharedIniFileCredentials({ profile: executionMode.profile })
  });
}

const SQS = require('./class/SQS').SQS;
let dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("Records length: ", event.Records.length)

  for (let i = 0; i < event.Records.length; i++) {
    try {
      let record = event.Records[i];

      if (executionMode.runningLocally)
        console.log('function.js, executionMode.runningLocally set to true.\nTesting locally - not interacting with AWS beyond pulling data down.');
      let sqs = new SQS(record);

      // bypass non INSERT event
      if (record.eventName == 'INSERT') {
        let customCode = new CustomCode(record);
        let procRes = await customCode.process();
        console.log('customCode.process returned :');
        console.log(procRes);

        if (executionMode.runningLocally) {
          console.log('Testing locally, not populating the DB and not sending out the SQS message.');
        } else { // store to AWS and message
          if (procRes) {
            await sqs.sendMessage('Process '+ record.dynamodb.NewImage.SortKey.S +' ok');
          } else {
            // delete the dynamodb item
            let params = {
              TableName: record.eventSourceARN.split("/")[1], // Get the table name from the event record info
              Key: {
                LeadingKey: record.dynamodb.NewImage.LeadingKey.S,
                SortKey: record.dynamodb.NewImage.SortKey.S
              }
            }
            await dynamodb.delete(params).promise();
            await sqs.sendMessage('Process '+ record.dynamodb.NewImage.SortKey.S +' failed');
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
  return "Done";
}

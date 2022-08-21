#! /usr/bin/env node

/*!
 * Copyright 2017-2018 Flatmax Pty Ltd
 * You may not retain, use nor modify this file without written consent from
 * Flatmax Pty Ltd.
 */
"use strict";

const ExecutionMode = require('./function/ExecutionMode').ExecutionMode;
let executionMode = new ExecutionMode(require('./function/config.json'));
if (!executionMode.setupOK()) // check local execution has the required variables setup
  return;

try {
  require.resolve('aws-sdk');
} catch (error){
  console.log(error);
  console.log('\n\n\Try installing aws-sdk : \n cd ..; npm i; cd testHarness\n\n\n');
  return;
}

const AWS = require('aws-sdk');
AWS.config.update({
  region: executionMode.region,
  credentials: new AWS.SharedIniFileCredentials({ profile: executionMode.profile })
})

let funcHandler = require('./function/function');
let exDBItem = require('./dbInsertEvent.json');
exDBItem.awsRegion = executionMode.region;
exDBItem.profileID = executionMode.profileID;
exDBItem.eventSourceARN = 'arn:aws:dynamodb:'+ executionMode.region +':'+ executionMode.profileID +':table/'+executionMode.table;

let dynamodb = new AWS.DynamoDB();
let records = [];
// this example allows you to restrict the amount of data returned (use with dynamodb.query) :
// let leadingKey = "us-east-1_8d2b999a";
// let params = {
//   TableName : executionMode.table,
//   KeyConditionExpression: "LeadingKey = :lk",
//   ExpressionAttributeValues: {
//     ":lk": { "S": leadingKey }
//   }
// };

// get all items in the table (use with dynamodb.scan)
let params = {
  TableName : executionMode.table
};

// populate dynamodb items
dynamodb.scan(params).promise().then(items => {
  // generate db event records
  items.Items.forEach(item => {
    let evtItem = JSON.parse(JSON.stringify(exDBItem)); // we need to deep copy here or the item doesn't change
    evtItem.dynamodb.Keys.LeadingKey = item.LeadingKey;
    evtItem.dynamodb.Keys.SortKey = item.SortKey;
    evtItem.dynamodb.NewImage = item;
    records.push(evtItem)
  })

  process.chdir('./function');

  // call the function handler
  funcHandler.handler({
    Records: records
  }).then(res => {
    console.log(res)
  })
}).catch(e=>{
  if (e.code === 'CredentialsError')
    console.log('\nconfig.json not setup\n\nplease run:\npushd ..; ./initial-setup.sh; popd\n');
  else
    throw e;
});

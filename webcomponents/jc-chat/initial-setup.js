#! /usr/bin/env node

"use strict";
const fs = require('fs');
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function Question(q) {
  return new Promise(function tryPromise(resolve) {
    rl.question(q, answer => {
      if (!answer) {
        console.log("Unknown answer!")
        return tryPromise(resolve)
      }
      return resolve(answer)
    })
  })
}

function intro() {
  console.log("         ..............")
  console.log("       ..              ..           Appycloud.tech")
  console.log("     ..                  ..         --------------")
  console.log("   ..   © appycloud.tech   ..       Let design and deploy serverless apps in elegant way")
  console.log("  ..                        ..")
  console.log(" ::     ----------------     ::     Populate your project info including")
  console.log("  ..                        ..      project name, region, client id, and api id")
  console.log("   ..       ℗ Flatmax      ..")
  console.log("     ..                  ..         Note: Go to your appycloud project - Appy Auth Setting")
  console.log("       ..              ..           to get the info")
  console.log("         ..............\n")  
}

async function oldConfig() {
  if (fs.existsSync('./demo/config.json')) {
    let config = require('./demo/config.json')
    console.log("Old config already exists")
    console.log(config)
    let createConfig = await Question("\n Do you want to create new config (Y/N)? ")
    if (createConfig.toLowerCase() == "y") {
      describe()
    } else {
      process.exit()
    }
  } else {
    describe()
  }
}

async function describe() {
  let projectName = await Question("\n What is the project name running in? ")
  let region = await Question("\n Which region is the project running in? ")
  let clientId = await Question("\n What is the project client id? ")
  let apiId = await Question("\n What is the project api id? ")
  rl.close();

  let config = JSON.stringify({
    "prefix": projectName, 
    "region": region,
    "clientId": clientId,
    "apiId": apiId
  })

  console.log("\n App config : "+ config);
  console.log("\n Done\n");
  fs.writeFileSync('./demo/config.json', config);
}
intro()
oldConfig()
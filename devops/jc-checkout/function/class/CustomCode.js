"use strict";
const https = require('https');
const config = require('./config.json');

class CustomCode {
  /**
   * @param record The dynamoDB record which triggered this function execution
   */
  constructor(record){
    console.log('CustomCode : constructed for record.eventName='+record.eventName)
    this.orderData = record.dynamodb.NewImage;
  }

  /**
   * Process the record item to telegram bot
   * @returns the bot process response
   */
  async process() {
    /* Put your code here to process the data */
    try {
      let responseBody = await new Promise((resolve, reject) => {
        let orderNo = this.orderData.SortKey.S.split("_")[1];
        let accountData = this.orderData.accountData.M;
        let chunks = [];
        let newOrder = 'New Order\n';
        newOrder += '-------------\n';
        newOrder += `Order ID: ${orderNo}\n`;
        // populating customer info
        for (let [key] of Object.entries(accountData)) {
          for (let [type, value] of Object.entries(accountData[key])) {
            newOrder += `${key}: ${value}\n`
          }
        }
        // populating shop cart
        newOrder += `\n> Cart:\n`
        let cart = this.orderData.cart.L;
        let itemData = '';
        cart.forEach(item => {
          for (let [key] of Object.entries(item.M)) {
            for (let [type, value] of Object.entries(item.M[key])) {
              if (key == 'price') {
                value = `@$${value}`;
              }
              if (key == 'item') {
                value = value.replace(/\+/g,' ');
              }
              itemData += `${key}: ${value} `;
            }
          }
          itemData += `;\n`;
        })
        newOrder += `${itemData}\n\n`;
        newOrder = encodeURIComponent(newOrder);
        let url = "https://api.telegram.org/bot"+ config.botToken +"/sendMessage?chat_id="+ config.chId +"&text="+ newOrder;
        let req = https.request(url, {}, (res) => {
          res.on("data", (chunk) => {
            chunks.push(chunk);
          });

          res.on("end", () => {
            var body = Buffer.concat(chunks);
            return resolve(body.toString())
          });

          res.on("error", (error) => {
            return reject(error)
          });
        });
        req.write("");
        req.end();
      })
      console.log(JSON.stringify(responseBody))
      return true
    } catch(e) {
      console.log(e)
      return false
    }
  }
}
module.exports = {
  CustomCode
}

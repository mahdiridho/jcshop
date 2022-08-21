"use strict";
const https = require('https');
const config = require('./config.json');

class CustomCode {
  /**
   * @param record The dynamoDB record which triggered this function execution
   */
  constructor(record){
    console.log('CustomCode : constructed for record.eventName='+record.eventName)
    this.orderData = record;
  }

  /**
   * Process the record item to telegram bot
   * @returns the bot process response
   */
  async process() {
    /* Put your code here to process the data */
    try {
      let responseBody = await new Promise((resolve, reject) => {
        if (!this.orderData.chId) {
          console.log(("Required Channel ID"))
          return reject({code: "AccessDenied", message: "Required Channel ID"})
        }
        let accountData = this.orderData.accountData;
        let chunks = [];
        let newOrder = 'New Order\n';
        newOrder += '-------------\n';
        // populating customer info
        for (const [key, value] of Object.entries(accountData)) {
          newOrder += `${key}: ${value}\n`
        }
        // populating shop cart
        newOrder += `> Cart:\n`
        let cart = this.orderData.cart;
        let itemData = '';
        cart.forEach(item => {
          for (let [key, value] of Object.entries(item)) {
            if (key == 'item') {
              value = value.replace(/\+/g,' ');
            }
            itemData += `${key}: ${value} `;
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

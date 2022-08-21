import { DbStream } from 'https://packages.appycloud.tech/db-stream/DbStream.js';

export class JcCheckout extends DbStream {
  static get properties() { 
    return {
      data: { type: Object } // checkout data to be stored into ddb
    }
  }

  updated(updates) {
    if (updates.has('data')) {
      this.dataChanged();
    }
  }

  dataChanged() {
    console.log("data changed")
    console.log(this.data)
  }
}
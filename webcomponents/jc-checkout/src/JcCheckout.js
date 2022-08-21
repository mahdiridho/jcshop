import { DbStream } from 'https://packages.appycloud.tech/db-stream/DbStream.js';

export class JcCheckout extends DbStream {
  static get properties() { 
    return {
      data: { type: Object } // checkout data to be stored into ddb
    }
  }

  dbStreamReady() {
    window.AWS = undefined;
  }

  updated(updates) {
    super.updated(updates);
    if (updates.has('data')) {
      this.dataChanged();
    }
  }

  dataChanged() {
    this.putItem(this.data).then(msg => {
      if (msg.indexOf('ok') >= 0) {
        this.dispatchEvent(new CustomEvent('checkoutResponse', { detail: {
          orderNo: msg.match("order: (.*) ok")[1].trim()
        } }));
      } else {
        this.dispatchEvent(new CustomEvent('checkoutResponse', { detail: {} }));
      }
    });
  }
}
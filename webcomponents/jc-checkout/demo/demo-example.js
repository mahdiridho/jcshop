import { html } from 'lit';
import { AwsAuthorization } from 'https://packages.appycloud.tech/aws-authorization/AwsAuthorization.js';
import '../jc-checkout';

/** Example demo element for testing element loading
*/
class DemoExample extends AwsAuthorization {
  static get properties() { 
    return {
      accountData: { type: Object },
      cart: { type: Array }
    }
  }

  constructor() {
    super();
    this.accountData = {
      accountName: "Mahdi Ridho",
      accountEmail: "mahdiridho@appycloud.tech",
      accountPhone: "084784738434",
      shipAddress: "Gamping",
      shipCity: "Sleman",
      shipState: "Yogyakarta",
      shipZip: 52943,
      shipCountry: "Indonesia"
    };
    this.cart = [{
      item: "Anvil L/S Crew Neck - Grey",
      qty: 1,
      size: "L",
      price: 15
    },
    {
      item: "Ladies Gmail T-Shirt",
      qty: 2,
      size: "M",
      price: 20
    }];
    this.totalPrice = 0;
    this.cart.forEach(c => this.totalPrice += c.price * c.qty);
  }

  render() {
    return html`
      <style>
        div[hidden] {
          display: none;
        }
        table {
          border: none;
          width: 100%;
        }
      </style>

      <div ?hidden="${this.auth}">
        <button @click="${this.login}">login</button>
      </div>
      <div id="auth">
        <button @click="${this.logout}">logout</button>
        <hr>
        <div>
          <h2>Account Information</h2>
          <input .value=${this.accountData.accountName} type="text" placeholder="Name" @input=${e=>this.accountData={...this.accountData,accountName:e.target.value}} /><br/>
          <input .value=${this.accountData.accountEmail} type="email" placeholder="Email" @input=${e=>this.accountData={...this.accountData,accountEmail:e.target.value}} /><br/>
          <input .value=${this.accountData.accountPhone} type="phone" placeholder="Phone Number" @input=${e=>this.accountData={...this.accountData,accountPhone:e.target.value}} /><br/>
          <textarea .value=${this.accountData.shipAddress} placeholder="Shipping Address" rows="3" cols="50" @input=${e=>this.accountData={...this.accountData,shipAddress:e.target.value}}>${this.accountData.shipAddress}</textarea><br/>
          <input .value=${this.accountData.shipCity} type="text" placeholder="City" @input=${e=>this.accountData={...this.accountData,shipCity:e.target.value}} /><br/>
          <input .value=${this.accountData.shipState} type="text" placeholder="State/Province" @input=${e=>this.accountData={...this.accountData,shipState:e.target.value}} /><br/>
          <input .value=${this.accountData.shipZip} type="text" placeholder="Zip/Postal Code" @input=${e=>this.accountData={...this.accountData,shipZip:e.target.value}} /><br/>
          <select .value=${this.accountData.shipCountry} @change=${e=>this.accountData={...this.accountData,shipCountry:e.target.value}}>
            <option value="Brazil">Brazil</option>
            <option value="Indonesia" selected>Indonesia</option>
            <option value="Canada">Canada</option>
            <option value="United States">United States</option>
          </select><br/>
          <h2>Order Summary</h2>
          <table>
            ${this.cart.map(c=>
              html`<tr><td>${c.item} - qty ${c.qty} @${c.price}</td><td>$${c.price*c.qty}</td></tr>`
            )}
            <tr><td><b>Total</b></td><td><b>$${this.totalPrice}</b></td></tr>
          </table><br />
          <button id="checkout" @click=${this.checkoutOrder}>Checkout</button>
        </div>
        <jc-checkout 
          @dbReady=${()=>this.shadowRoot.querySelector("div#auth").hidden=false}
          @checkoutResponse=${this.checkoutResponse}>
        </jc-checkout>
      </div>
    `;
  }

  checkoutResponse(e) {
    if (e.detail.orderNo) {
      alert(`Order: ${e.detail.orderNo} created`)
    } else {
      alert(`Order failed`)
    }
    this.shadowRoot.querySelector("button#checkout").disabled = false;
  }

  checkoutOrder() {
    this.shadowRoot.querySelector("button#checkout").disabled = true;
    this.checkout.data = {accountData: this.accountData, cart: this.cart};
  }

  get checkout() {
    return this.shadowRoot.querySelector("jc-checkout")
  }

  /**
   * Lifecycle called after DOM updated on the first time
   * Pulling the app config and waiting for the sts state
   */
  firstUpdated() {
    super.firstUpdated();
    fetch("./config.json").then(response => { // load the file data
      return response.json()
    }).then(json => {
      this.region = json.region;
      this.userPoolName = json.prefix;
      this.clientId = json.clientId;
      this.apiId = json.apiId;
      this.defaultNotif = true;
      this.autoRefreshToken = true;
    }).catch(e => {
      console.log("ERROR : ", e)
      return e
    })
    this.updateComplete.then(async () => {
      this.shadowRoot.querySelector("div#auth").hidden = true;
    })
  }

  async authorized() {
    super.authorized();
    // set local AWS config based on the selected project
    // arg1 = prefix
    // arg2 = region
    // arg3 = is cross model?
    this.checkout.setLocalConfig(this.userPoolName, this.region, true);
    this.shadowRoot.querySelector("div#auth").hidden = false;
  }
}
customElements.define('demo-example', DemoExample);

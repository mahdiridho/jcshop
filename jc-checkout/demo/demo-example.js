import { html } from 'lit';
import { AwsAuthorization } from 'https://packages.appycloud.tech/aws-authorization/AwsAuthorization.js';
import '../jc-checkout';

/** Example demo element for testing element loading
*/
class DemoExample extends AwsAuthorization {
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
          <input type="phone" placeholder="Phone Number" /><br/>
          <textarea placeholder="Shipping Address" rows="3" cols="50"></textarea><br/>
          <input type="text" placeholder="City" /><br/>
          <input type="text" placeholder="State/Province" /><br/>
          <input type="text" placeholder="Zip/Postal Code" /><br/>
          <select>
            <option value="Brazil">Brazil</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Canada">Canada</option>
            <option value="United States">United States</option>
          </select><br/>
          <h2>Order Summary</h2>
          <table>
            <tr><td>Anvil L/S Crew Neck - Grey</td><td>$22.15</td></tr>
            <tr><td><b>Total</b></td><td><b>$22.15</b></td></tr>
          </table><br />
          <button>Checkout</button>
        </div>
        <jc-checkout></jc-checkout>
      </div>
    `;
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
      this.shadowRoot.querySelector("div#auth").hidden = true
    })
  }

  async authorized() {
    super.authorized();
    window.AWS = undefined;
    this.shadowRoot.querySelector("div#auth").hidden = false;
  }
}
customElements.define('demo-example', DemoExample);

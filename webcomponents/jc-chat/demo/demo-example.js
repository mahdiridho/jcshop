import { html } from 'lit';
import { AwsAuthorization } from 'https://packages.appycloud.tech/aws-authorization/AwsAuthorization.js';
import '../jc-chat';

/** Example demo element for testing element loading
*/
class DemoExample extends AwsAuthorization {
  static get properties() { 
    return {
    }
  }

  constructor() {
    super();
    this.globalNotif = "globalchat";
  }

  render() {
    return html`
      <style>
        div[hidden] {
          display: none;
        }
      </style>
      <div ?hidden="${this.auth}">
        <button @click="${this.login}">login</button>
      </div>
      <div id="auth">
        <button @click="${this.logout}">logout</button>
        <hr>
        <h1>CHAT APP</h1>
        <jc-chat></jc-chat>
      </div>
    `;
  }

  get chat() {
    return this.shadowRoot.querySelector("jc-chat");
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
      this.globalNotif = "globalchat";
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
    this.chat.db.setLocalConfig(this.userPoolName, this.region, true);
    this.chat.sqs.setLocalConfig(this.userPoolName, this.region, true);
    this.shadowRoot.querySelector("div#auth").hidden = false;
  }
}
customElements.define('demo-example', DemoExample);

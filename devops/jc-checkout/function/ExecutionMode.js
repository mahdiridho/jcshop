"use strict";

/** Class to manage information about local (not on Lambda) execution
*/
class ExecutionMode {
  constructor(config){
    // local debugging when not running on Lambda
    this.runningLocally = process.env.AWS_REGION==undefined;

    if (config){
      this.region=config.region;
      this.profile=config.profile;
      this.table=config.table;
    }
  }

  /** Check the setup of the region and profile variables for non-lambda execution
  @returns false if region or profile variables aren't set
  */
  setupOK(){
    if (!this.region || !this.profile){
      console.log('\nregion|profile aren\'t setup correctly in ExecutionMode.js\n');
      console.log('Run initial-setup.sh to help setting them up.\n')
      return false;
    }
    return true;
  }
}

module.exports = {
  ExecutionMode
}

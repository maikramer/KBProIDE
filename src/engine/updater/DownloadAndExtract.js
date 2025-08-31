const FileSystem = {};
const Utils = { _extend: Object.assign };
// Prefer util.unzip (yauzl-based) em vez de adm-zip
const fs = {};
const crypto = { createHash: function(){ return { update: function(){}, digest: function(){ return ""; } }; } };
const os = { tmpdir(){ return "/tmp"; } };
const path = { join(){ return Array.from(arguments).join("/"); } };
let got = null;

import util from "@/engine/utils";

const AppPath = "/";

const errors = [
  "version_not_specified",
  "cannot_connect_to_api",
  "no_update_available",
  "api_response_not_valid",
  "update_file_not_found",
  "failed_to_download_update",
  "failed_to_apply_update",
];

var Updater = {
  /**
   * The setup
   * */
  setup: {
    logFile: "updater-log.txt",
    requestOptions: {},
    callback: false,
    progresscallback: false,
    debug: false,
  },

  /**
   * The new update information
   * */
  update: {
    last: null,
    source: null,
    file: null,
    sha1: null,
  },

  /**
   * Init the module
   * */
  init: function(setup) {
    this.setup = Utils._extend(this.setup, setup);
    this.log("AppPath: " + AppPath);
  },

  /**
   * Sha1
   * */
  sha1: function(buffer) {
    let fsHash = crypto.createHash("sha1");
    fsHash.update(buffer);
    return fsHash.digest("hex");
  },

  /**
   * Logging
   * */
  log: function(line) {
    // Log it
    if (this.setup.debug) {
      console.log("Updater: ", line);
    }

    // Put it into a file
    if (this.setup.logFile) {
      if (this.setup.debug) {
        console.log("%s + %s + %s", AppPath, this.setup.logFile, line);
      }
      //FileSystem.appendFileSync(AppPathFolder + this.setup.logFile, line + "\n");
    }
  },

  /**
   * Triggers the callback you set to receive the result of the update
   * */
  end: function(error, body) {
    if (typeof this.setup.callback !== "function") return false;
    this.setup.callback.call(
        this,
        error !== "undefined" ? errors[error] : false,
        this.update.last,
        body,
    );
  },

  /**
   * Download the update file
   * */
  process: function(targetDir, callback) {
    if (callback) {
      this.setup.callback = callback;
    }

    return Promise.resolve();
  },

  progress: function(callback) {
    if (callback) {
      this.setup.progresscallback = callback;
    }
  },
};

export default Updater;
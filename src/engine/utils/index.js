import ui from "./ui";

// web-only: não requisitar módulos Node
let path = { resolve: (p)=>p };

let fs = null;
if (!fs) {
  fs = {
    existsSync: function(){ return false; },
    readFileSync: function(){ return ""; },
    readdirSync: function(){ return []; },
    statSync: function(){ return { isDirectory: function(){ return false; } }; },
    lstatSync: function(){ return { isDirectory: function(){ return false; } }; },
    unlinkSync: function(){},
    rmdirSync: function(){},
  };
}
const rootDir = __dirname; // require('electron-root-path').rootPath;
let os = { arch: function(){ return "x64"; } };

let unzipModule = { unzip: function(){ return Promise.reject("unzip not available in web"); } };
try {
  if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
    // evitar referência direta a require em ambiente web
    const dynReq = (0, eval)('require');
    const mod = dynReq ? dynReq("./unzip") : null;
    unzipModule = mod && mod.default ? mod.default : mod || unzipModule;
  }
} catch (e) {}
import compiler from "./compiler";
import regex_parser from "./regex-parser";

var baseDir = "";
console.log("app dirname = " + rootDir);
// proteger acesso a process no ambiente web
const hasProcess = (typeof process !== 'undefined');
const nodeEnv = hasProcess && process.env ? process.env.NODE_ENV : "production";
const platform = hasProcess && process.platform ? process.platform : "web";

if (hasProcess && nodeEnv === "development") {
  if (platform === "win32") {
    baseDir = rootDir + "/../../../../../..";
  } else if (platform === "darwin") {
    baseDir = rootDir + "/../../../../../../../..";
  } else if (platform === "linux") {
    baseDir = rootDir + "/../../../../../..";
  }
} else if (hasProcess) {
  if (platform === "win32") {
    baseDir = rootDir + "/../..";
  } else if (platform === "darwin") {
    baseDir = rootDir + "/../..";
  } else if (platform === "linux") {
    baseDir = rootDir + "/../..";
  }
}
try { baseDir = path ? path.resolve(baseDir) : baseDir; } catch (e) {}
console.log(`baseDir=${baseDir}`);

var humanFileSize = function(bytes, si = true) {
  var thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }
  var units = si
      ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
      : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  var u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + " " + units[u];
};

const isElectron = typeof process !== 'undefined' && process.versions && !!process.versions.electron;
let requireFunc = function(){ return null; };
try {
  if (typeof __webpack_require__ === "function" && typeof __non_webpack_require__ !== "undefined") {
    requireFunc = __non_webpack_require__;
  }
} catch (e) {}
if (!requireFunc.cache) { requireFunc.cache = {}; }
const clearCacheRequire = function(){
  if (!requireFunc || !requireFunc.cache) { return; }
  try {
    Object.keys(requireFunc.cache).forEach(function(key) {
      delete requireFunc.cache[key];
    });
  } catch (e) {}
};
const vueLoader = function(file) { //this section from https://www.npmjs.com/package/vue-file-compiler
  if (!fs) { return null; }
  let vue = fs.readFileSync(file, "utf-8");
  let validRegex = new RegExp(
      "^[^]*<template>[^]+<\/template>[^]*<script>[^]*export default[^]+<\/script>[^]*(<style[^]*>[^]*<\/style>[^]*)?$",
      "gm");

  if (validRegex.test(vue)) {
    let template = vue.replace(
        new RegExp("^[^]*<template>([^]+)<\/template>[^]*$", "gm"), "$1");
    template = template.split("`").join("\\`");

    let script = vue.replace(
        new RegExp("^[^]*<script>([^]*)export default[^]+<\/script>[^]*$",
            "gm"), "$1");
    let component = vue.replace(
        new RegExp("^[^]*export default[\s\n]*(\{[^]*\})[^]*<\/script>[^]*$",
            "gm"), "$1");

    let style = null;
    if (new RegExp("<style[^]*>[^]*<\/style>", "gm").test(vue)) {
      style = vue.replace(
          new RegExp("^[^]*<style[^]*>([^]*)<\/style>[^]*$", "gm"), "$1");
    }

    let styleLang = "css";
    if (/lang="[^]+"/.test(vue)) {
      styleLang = vue.replace(/^[^]*lang="([^]+)"[^]*$/, "$1");
    }

    let js = `${script}

var component = ${component}
component.template = \`${template}\`

component`;

    return {
      js,
      style,
      styleLang,
    };
  } else {
    console.log("Invalid vue file : " + file);
  }
};
const vueRuntimeComponent = function(file) {
  let res = vueLoader(file);
  let component = eval(res.js);
  return component;
};

//var camel = function(str) {
//  const camel = (str || "").replace(/-([^-])/g, g => g[1].toUpperCase());
//  return capitalize(camel);
//};

const camelActual = function(str) {
  return (str || "").replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
};
const humanize = function(str) {
  let ret = (str || "").replace(/-(\w)/g, (_, c) => (c ? " " + c.toUpperCase() : ""));
  return ret.charAt(0).toUpperCase() + ret.slice(1);
};
const kebab = (str) => {
  return (str || "").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};
const randomString = function(length = 5) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const randomElement = (arr = []) => {
  return arr[Math.floor(Math.random() * arr.length)];
};



const toggleFullScreen = () => {
  let doc = window.document;
  let docEl = doc.documentElement;

  let requestFullScreen = docEl.requestFullscreen ||
      docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen ||
      docEl.msRequestFullscreen;
  let cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen ||
      doc.webkitExitFullscreen || doc.msExitFullscreen;

  if (!doc.fullscreenElement && !doc.mozFullScreenElement &&
      !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  } else {
    cancelFullScreen.call(doc);
  }
};

var loadCofigComponents = function(obj, compName) {
  var componentData = {};
  var persistenceData = [];
  var methods = {};

  if ("persistence" in obj) {//load persistence
    Object.keys(obj.persistence).forEach(function(pkey) {
      if (!persistenceData.includes(pkey)) {
        persistenceData.push(pkey);
      }
      // load data from localStorage if exist
      if (localStorage[compName + "." + pkey]) {
        let lcData = localStorage[compName + "." + pkey];
        componentData[pkey] = lcData == "undefined" ? null : JSON.parse(lcData);
      } else {
        componentData[pkey] = obj.persistence[pkey];
      }
    });
  }
  if ("data" in obj) {//load reactive data
    Object.keys(obj.data).forEach(function(dkey) {
      componentData[dkey] = obj.data[dkey];
    });
  }
  if ("method" in obj) {//load method
    Object.keys(obj.method).forEach(function(mkey) {
      methods[mkey] = obj.method[mkey];
    });
  }
  return {
    data: componentData,
    persistence: persistenceData,
    method: methods,
  };
};
var rmdirf = function(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        rmdirf(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
const walk = function(dir) {
  var results = [];
  if (!fs.existsSync(dir)) {
    return results;
  }
  var list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + "/" + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(walk(file));
    } else {
      /* Is a file */
      results.push(file);
    }
  });
  return results;
};
//const dirWalk = source => readdirSync(source, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

const dirWalk = function(dir) {
  let results = [];
  if (!fs.existsSync(dir)) {
    return results;
  }
  let list = fs.readdirSync(dir,{ withFileTypes: true });
  list.forEach(function(file) {
    if(!file.isDirectory()){
      return;
    }
    let target = dir + "/" + file.name;
    results.push(target);
    results = results.concat(dirWalk(target));
  });
  return results;
};

function promiseTimeout(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(time);
    }, time);
  });
};

//from kbide
// https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings#answer-30106551
function b64EncodeUnicode(str) {
  return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      }));
}

function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(""));
}

export default {
  //camel,
  randomString,
  randomElement,
  toggleFullScreen,
  camelActual,
  kebab,
  humanize,
  ui,
  requireFunc,
  clearRequire : clearCacheRequire,
  humanFileSize,
  loadCofigComponents,
  walk,
  dirWalk,
  rmdirf,
  promiseTimeout,
  b64EncodeUnicode,
  b64DecodeUnicode,
  filterFileName: function(obj, filterName) {
    var res = {};
    Object.keys(obj).forEach(key => {
      Object.keys(obj[key]).forEach(ckey => {
        if (ckey.toLowerCase().startsWith(filterName.toLowerCase())) { //ignorcase naja
          if (!(key in res)) {
            res[key] = {};
          }
          res[key][ckey] = obj[key][ckey];
        }
      });
    });
    return res;
  },
  //-------- file ------//
  fs: fs,
  os: os,
  rootDir: rootDir,
  baseDir: baseDir,
  componentDir: `${baseDir}/components`,
  staticComponentWebpackDir: "./components",
  pluginDir: `${baseDir}/plugins`,
  packageDir: `${baseDir}/packages`,
  boardDir: `${baseDir}/boards`,
  platformDir: `${baseDir}/platforms`,
  //------- plugin -----//
  vueLoader,
  vueRuntimeComponent,
  //------- zip --------//
  unzip: unzipModule.unzip,
  compiler,
  regex: regex_parser,
};

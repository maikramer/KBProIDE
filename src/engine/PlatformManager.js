import util from "@/engine/utils";

const isElectron = typeof process !== 'undefined' && process.versions && !!process.versions.electron;
let fs = null; try { if (isElectron) { fs = require("fs"); } } catch(e) { fs = null; }
let os = null; try { if (isElectron) { os = require("os"); } } catch(e) { os = { arch(){ return 'x64'; } }; }
let got = null;

const getPlatformInfo = function(name) {
  return new Promise((resolve, reject) => {
    let query = { filter: { name: { eq: name } } };
    Vue.prototype.$db2.getItems("platforms", query).then((data, meta) => {
      resolve(data.data);
    }).catch(err => {
      console.error("list online platform error : " + err);
      reject(err);
    });
  });
};
const installPlatformByName = function(name, cb) {
  return new Promise((resolve, reject) => {
    getPlatformInfo(name).then(info=>{
      if(!info){
        reject("no platform info");
      }
      if(info.length === 0){
        reject("no platform info");
      }
      console.log("received platform");
      console.log(info);
      info = info[0];
      if (info.status !== "published"){
        reject("platform is not published yet");
      }
      if (info.platform && info.platform !== "") {
        return installPlatformByName(info.name);
      }
      if (info.zip == null){
        reject("platform not contain release zip file");
      }
      if (!isElectron || !fs) { reject("not supported in web"); }
      else if (fs.readdirSync(util.platformDir).includes(info.name)) {
        reject("your already have this platform");
      } else { //download file
        let arch = os.arch();
        const platform = (typeof process !== 'undefined' && process.platform) ? process.platform : 'web';
        if (platform === "win32" && arch === "ia32") {
          info.zip =  info.zip + "-win32.zip";
        }else if(platform === "win32" && arch === "x64"){
          info.zip =  info.zip + "-win64.zip";
        }else if (platform === "darwin") {
          info.zip = info.zip + "-darwin.zip";
        } else if (platform === "linux") {
          if(arch.startsWith("armv7")){
            info.zip = info.zip + "-linux-armv7.zip";
          }else if(arch.startsWith("arm64")){
            info.zip = info.zip + "-linux-arm64.zip";
          }else{
            info.zip = info.zip + "-linux.zip";
          }
        }
        let zipUrl = info.zip;
        let zipFile = os.tmpdir() + "/" + util.randomString(10) + ".zip";
        got.stream(zipUrl)
          .on("downloadProgress", p => {
            cb && cb({ process: "platform", status: "DOWNLOAD", state: { percent: p.percent, transferred: p.transferred, total: p.total } });
          })
          .on("error", err => reject(err))
          .on("end", () => {
            util.unzip(zipFile, {dir: util.platformDir}, p => {
              cb && cb({process: "platform", status: "UNZIP", state: p});
            }).then(()=>resolve()).catch(err=>reject(err));
          })
          .pipe(fs.createWriteStream(zipFile));
      }
    });
  })
};

const updatePlatformByName = function(name) {

};

export default {
  installPlatformByName,
  updatePlatformByName,
};

const isElectronRun = false;
const webpack = require('webpack');

module.exports = {
  runtimeCompiler: true,
  lintOnSave: false,
  configureWebpack: {
    optimization: {

    },
    resolve: {
      alias: {
        electron: require('path').resolve(__dirname, 'src/shims/electron-renderer-stub.js'),
      },
      fallback: {
        fs: false,
        module: false,
        path: false,
        crypto: false,
        stream: false,
        zlib: false,
        os: false,
        http: false,
        https: false,
        vm: false,
        querystring: false,
        timers: false,
        events: false,
        buffer: false,
        net: false,
        tls: false,
        dns: false,
        http2: false,
        child_process: false,
      },
    },
    target: "web",
    plugins: [],
  },
  pluginOptions: {},
};

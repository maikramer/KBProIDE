// @ts-nocheck
import { createApp, reactive } from "vue";
import VuetifyStubs from "./engine/plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "font-awesome/css/font-awesome.css";
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import './theme/tailwind.css';

import cm from "@/engine/ComponentManager";
import bm from "@/engine/BoardManager";
import ui from "@/engine/UIManager";
import pfm from "@/engine/PlatformManager";
import pm from "@/engine/PluginManager";
import compiler from "@/engine/Compiler";
import util from "@/engine/utils";
import blockly_utils from "@/engine/utils/blockly";
import mitt from 'mitt';

const isElectron = typeof process !== 'undefined' && (process as any).versions && !!(process as any).versions.electron;
let fsPromises: any = null;
try { if (isElectron) { fsPromises = require("fs").promises; } } catch (e) { fsPromises = null; }
const checkFileExists = async (path: string) => {
  if (!fsPromises) { return false; }
  try { await fsPromises.stat(path); return true; } catch { return false; }
};

const DirectusSDK = require('@directus/sdk-js');
const directus_client = DirectusSDK({
  url : "https://manage.kbide.org/",
  project : "_",
  storage: window.localStorage
});
const directus_dev_client = DirectusSDK({
  url : "https://manage.kbide.org/",
  project : "_",
  storage: window.localStorage
});

(async()=>{
  const $db_dev = directus_dev_client;
  const $db2 = directus_client;
  const $track = {
      clientID: "",
      set: function(key: string, value: any){ if (key === 'clientID') { this.clientID = value; } return Promise.resolve(true); },
      pageview: function(_path?: string, _title?: string){ return Promise.resolve({ clientID: this.clientID || '' }); },
      event: function(_category?: string, _action?: string, _params?: any){ return Promise.resolve(true); },
  } as any;

  const emitter = mitt();
  const $global: any = reactive((cm && cm.data) ? cm.data : {});
  ($global as any).$on = emitter.on; ($global as any).$off = emitter.off; ($global as any).$emit = emitter.emit;
  if (!$global.setting) {
    $global.setting = { firstUse: false, devMode: false, color: "#1976d2", plugin: { sortby: "Name" }, package: { sortby: "Name" }, board_selector: { sortby: "name" }, kidsMode: false };
  } else if ($global.setting && typeof $global.setting.kidsMode === 'undefined') {
    $global.setting.kidsMode = false;
  }
  if (!$global.board) {
    $global.board = {
      board: "",
      board_info: { platform: "", name: "", title: "", dir: "", version: "", image: "", description: "" }
    } as any;
  }
  if (!$global.ui) {
    $global.ui = {
      bottomTab: [],
      bottomTabModel: null,
      rightTab: [],
      rightTabModel: null,
      rightDrawerComponent: false,
      leftDrawerComponent: false,
      snackbarStatus: false,
      snackbarConfig: { y: 'bottom', x: 'right', color: 'info', mode: 'multi-line', timeout: 3000, text: '' },
      removeAllTab: (name: string) => {
        try {
          const tabs = $global.ui.rightTab as any[];
          $global.ui.rightTab = tabs.filter((t: any) => t.name !== name);
        } catch (e) {}
      },
    } as any;
  }
  if (!$global.editor) {
    $global.editor = { mode: 1, blockCode: '', sourceCode: '', Blockly: (window as any).Blockly || null } as any;
  }
  if (!$global.editor.editor_options) {
    $global.editor.editor_options = { readOnly: false } as any;
  }
  if (!$global.plugin) {
    $global.plugin = { sortby: 'Name', pluginInfo: { categories: [] }, plugins: {} } as any;
  } else if (!$global.plugin.pluginInfo) {
    $global.plugin.pluginInfo = { categories: [] } as any;
  }
  if (!$global.package) {
    $global.package = { sortby: 'Name' } as any;
  }
  const $vuetify = { theme: { primary: $global.setting.color || "#1976d2" }, dark: false } as any;

  // === Persistência de tema/cor/kids ===
  try {
    const savedDark = localStorage.getItem('kb_dark');
    const savedColor = localStorage.getItem('kb_color');
    const savedBoard = localStorage.getItem('kb_board');
    const savedKids = localStorage.getItem('kb_kids');
    const root = document.documentElement;
    if (savedDark != null) {
      $vuetify.dark = savedDark === 'true';
      if ($vuetify.dark) { root.classList.add('dark'); } else { root.classList.remove('dark'); }
    }
    if (savedColor) {
      $vuetify.theme.primary = savedColor; $global.setting.color = savedColor;
    }
    if (savedBoard) {
      $global.board.board = savedBoard;
      $global.board.board_info = Object.assign({}, $global.board.board_info, { name: savedBoard, title: savedBoard });
    }
    if (savedKids != null) {
      $global.setting.kidsMode = savedKids === 'true';
      if ($global.setting.kidsMode) { root.classList.add('kids'); } else { root.classList.remove('kids'); }
    }
    $global.$on('theme-change', (color: string)=>{ try { localStorage.setItem('kb_color', color); } catch(_){} });
    $global.$on('theme-dark', (isDark: boolean)=>{ try { localStorage.setItem('kb_dark', String(!!isDark)); } catch(_){} });
    $global.$on('kids-mode-change', (on: boolean)=>{ try { localStorage.setItem('kb_kids', String(!!on)); const r = document.documentElement; if (on) r.classList.add('kids'); else r.classList.remove('kids'); } catch(_){} });
  } catch (e) {}

  const hideLoading = () => {
    try {
      const el = document.querySelector('.loading');
      if (el) { (el as HTMLElement).style.display = 'none'; }
    } catch (e) {}
  };

  if ((window as any).config && (window as any).config.mode) {
    (window as any).config.mode = parseInt((window as any).config.mode);
    $global.editor.mode = (window as any).config.mode;
  }
  if ((window as any).config && (window as any).config.file && await checkFileExists((window as any).config.file)) {
    let targetFile = (window as any).config.file;
    if (targetFile.endsWith(".bly")) {
      let contentFile = fsPromises ? await fsPromises.readFile(targetFile, "utf8") : "";
      $global.editor.blockCode = util.b64DecodeUnicode(contentFile);
    } else if ((window as any).config.file.endsWith(".ino")) {
      $global.editor.sourceCode = fsPromises ? await fsPromises.readFile(targetFile, "utf8") : "";
    }
  }

  let engineData = { util, compiler, componentManager: cm, boardManager: bm, platformManager: pfm, uiManager: ui, pluginManager: pm };
  const $engine = reactive(engineData as any);

  const app = createApp(App);
  app.config.globalProperties.$global = $global;
  app.config.globalProperties.$engine = $engine;
  app.config.globalProperties.$db_dev = $db_dev;
  app.config.globalProperties.$db2 = $db2;
  app.config.globalProperties.$track = $track;
  app.config.globalProperties.$vuetify = app.config.globalProperties.$vuetify || $vuetify;
  app.provide('global', $global);
  app.provide('engine', $engine);
  app.provide('db', $db2);
  app.provide('db_dev', $db_dev);
  app.provide('track', $track);
  app.use(VuetifyStubs);
  app.use(router);
  app.use(store);
  app.mount('#app');
  (window as any).app = app;

  // === Hotkeys Globais ===
  window.addEventListener('keydown', (e: KeyboardEvent)=>{
    const isMod = e.ctrlKey || (e as any).metaKey;
    const isAlt = e.altKey;
    const key = (e.key || '').toLowerCase();
    if (isMod && key === 'p') { e.preventDefault(); $global.$emit('open-command-palette'); return; }
    if (isMod && key === 's') { e.preventDefault(); $global.$emit('hotkey', 'save'); return; }
    if (isMod && key === 'o') { e.preventDefault(); $global.$emit('hotkey', 'open'); return; }
    if (isMod && key === 'n') { e.preventDefault(); $global.$emit('hotkey', 'new'); return; }
    if (isMod && key === '1') { e.preventDefault(); $global.editor.mode = 1; $global.$emit('editor-mode-change', 1, false, false); return; }
    if (isMod && key === '2') { e.preventDefault(); $global.editor.mode = 2; $global.$emit('editor-mode-change', 2, false, false); return; }
    if (isMod && key === '3') { e.preventDefault(); $global.editor.mode = 3; $global.$emit('editor-mode-change', 3, false, false); return; }
    if (isMod && isAlt && key === 'z') { e.preventDefault(); $global.$emit('toggle-zen'); return; }
  }, { capture: true });

  hideLoading();
})().catch(err=>{ console.error(err); });



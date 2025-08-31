<template>
    <div class="editor-page-wrap">
        <EditorTopbar
          :mode="$global.editor.mode"
          @new-file="$global.$emit('file-new')"
          @open-file="$global.$emit('file-open')"
          @save-file="$global.$emit('file-save')"
          @set-mode="(m)=> $global.$emit('editor-mode-change', m)"
        />
        <multipane
            class="vertical-panes-editor"
            layout="vertical"
            @paneResizeStop="onResizePanel"
            fill-height
        >
        <!-- editor -->
        <div
                class="pane"
                :style="[ this.$global.editor.mode == 1
                              ? { width: '100%', height: '100%' }
                              : this.$global.editor.mode == 2
                              ? { minWidth: '500px', width: '75%' }
                              : { width: '0px' }
                        ]"
        >
            <div
                    id="blocklyDiv"
                    style="position:absolute; width:100%; height:100%;"
                    color="onThemeChange"
            ></div>
            <xml id="toolbox" ref="toolbox" style="display: none">
                <category name="Básico" colour="160" icon="/static/icons/SVG/c1.svg">
                    <block type="basic_led16x8"></block>
                </category>
            </xml>

            <v-dialog v-model="variableDialog" persistent max-width="600px">
                <v-card>
                    <v-card-title>
                        <span class="headline">{{ variableMessage }}</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container grid-list-md>
                            <v-flex xs12>
                                <v-text-field
                                        v-model="variable_name"
                                        label="Nome da variável"
                                        required
                                        clearable
                                        counter
                                        maxlength="32"
                                        :rules="[variable_name_validator]"
                                ></v-text-field>
                            </v-flex>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" flat @click="variableDialog = false">Fechar</v-btn>
                        <v-btn
                                color="blue darken-1"
                                flat
                                :disabled="!validated"
                                ref="variableOK"
                                @click="variableDialog = false"
                        >
                            Salvar
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-dialog v-model="cameraDialog" persistent max-width="785px">
                <v-card>
                    <v-card-title>
                        <!--                        <span class="headline">{{variableMessage}}</span>-->
                        <span class="headline font-bold">
                            Capturando imagem da câmera.
                        </span>
                    </v-card-title>
                    <v-card-text style="padding-top: 0">
                        <v-container grid-list-md style="padding-top: 0">
                            <v-flex xs12>
                                <div style="display: flex; justify-content: center">
                                    <video
                                            ref="video"
                                            id="video"
                                            width="640"
                                            height="480"
                                            autoplay
                                    ></video>
                                    <canvas
                                            ref="canvas"
                                            style="display:none;"
                                            width="640"
                                            height="480"
                                    ></canvas>
                                </div>
                                <div style="display: flex; justify-content: center; margin-top: 15px">
                                    <v-btn
                                            id="snap"
                                            class="btn-primary"
                                            @click="snapCameraDialog"
                                    >
                                        <i class="fa fa-camera"></i>&ensp;
                                        Capturar
                                    </v-btn>
                                    <v-btn
                                            id="snap"
                                            class="btn-primary"
                                            @click="refreshCameraDialog"
                                    >
                                        <i class="fa fa-refresh"></i>&ensp;
                                        Atualizar
                                    </v-btn>
                                    <v-btn class="btn-success" flat @click="saveCameraDialog">
                                        Salvar
                                    </v-btn>
                                    <v-btn class="btn-danger" flat @click="closeCameraDialog">
                                        Fechar
                                    </v-btn>
                                </div>
                            </v-flex>
                        </v-container>
                    </v-card-text>
                </v-card>
            </v-dialog>

            <v-dialog v-model="musicDialog" max-width="785px">
                <piano-dialog
                        ref="musicNotes"
                        @close="() => { musicDialog = false; }"
                ></piano-dialog>
            </v-dialog>
            <v-dialog v-model="ttsDialog" max-width="600px">
                <t-t-s-dialog
                        ref="ttsWords"
                        @close="() => { ttsDialog = false; }"
                ></t-t-s-dialog>
            </v-dialog>
        </div>
        <!-- end -->
        <multipane-resizer v-if="this.$global.editor.mode == 2"></multipane-resizer>
        <!-- source code -->
        <div
                class="pane"
                :style="[
            this.$global.editor.mode == 1
              ? { width: '0px' }
              : this.$global.editor.mode == 2
              ? { flexGrow: 1 }
              : { width: '100%', height: '100%' }
          ]"
        >
            <MonacoEditor
                    ref="cm"
                    v-if="$global.editor.mode < 3"
                    :value="$global.editor.rawCodeMode ? $global.editor.rawCode : $global.editor.previewSourceCode"
                    @input="val => ($global.editor.rawCodeMode ? ($global.editor.rawCode = val) : ($global.editor.previewSourceCode = val))"
                    class="editor"
                    language="cpp"
                    theme="vs-dark"
                    :options="this.editor_options"
            />
            <MonacoEditor
                    ref="cm"
                    v-else-if="$global.editor.mode == 3"
                    v-model="$global.editor.sourceCode"
                    class="editor"
                    language="cpp"
                    theme="vs-dark"
                    :options="this.editor_options"
            />
        </div>
        <!-- end -->
    </multipane>
    </div>
</template>
<script>
  // @ts-nocheck
  /* eslint-disable */
  const isElectron = typeof process !== 'undefined' && process.versions && !!process.versions.electron;
  let electron = null; try { if (isElectron) { electron = require("electron"); } } catch(e) { electron = null; }
  // remover path no web
  const xmlParser = new DOMParser();
  // === UI Management ===
  // === Blockly ===
  import * as Blockly from "blockly/core";
  import * as En from "blockly/msg/en";
  import "blockly/blocks";
  import { javascriptGenerator } from "blockly/javascript";
  // === Editor ===
  //import MonacoEditor from "vue-monaco";
  // === uitls ===
  import util from "@/engine/utils";
  import EditorTopbar from "@/engine/components/editor/EditorTopbar.vue";
  import Multipane from "@/engine/components/common/Multipane.vue";
  import MultipaneResizer from "@/engine/components/common/MultipaneResizer.vue";

  // Web stubs: block loading/rendering and formatter
  const loadBlock = async function(boardInfo){
    try {
      const board = 'esp32';
      const platform = 'arduino-esp32';
      const tryFetch = async (path) => {
        const r = await fetch(path, { cache: 'no-store' });
        if (!r.ok) { throw new Error('not found'); }
        return r.json();
      };
      let json = null;
      try { json = await tryFetch(`/static/data/${board}.toolbox.json`); }
      catch(e) { try { json = await tryFetch(`/static/data/platform-${platform}.toolbox.json`); } catch(_) {} }
      if (!json) { throw new Error('toolbox not found'); }
      return {
        blocks: json.categories || [],
        base_blocks: [],
        initial_blocks: '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables></xml>'
      };
    } catch(e) {
      return {
        blocks: [],
        base_blocks: [],
        initial_blocks: '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables></xml>'
      };
    }
  };
  const renderBlock = function(blockCategories){
    if (!Array.isArray(blockCategories) || blockCategories.length === 0) { return ""; }
    const esc = (s)=> String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    return blockCategories.map(cat => {
      const blocks = Array.isArray(cat.blocks) ? cat.blocks.map(b => {
        const type = b && b.type;
        if (!type || !Blockly || !Blockly.Blocks || !Blockly.Blocks[type]) { return ''; }
        const extra = b.xml ? b.xml : '';
        return `<block type="${esc(type)}">${extra}</block>`;
      }).join('') : '';
      const colour = (cat.colour != null) ? ` colour="${cat.colour}"` : '';
      return `<category name="${esc(cat.name || 'Categoria')}"${colour}>${blocks}</category>`;
    }).join('');
  };
  const loadAndRenderPluginsBlock = function(_Blockly,_boardInfo,_pluginInfo){ return ""; };
  const reformatCode = function(code){ return code; };

  let fs = null; try { if (isElectron) { fs = require("fs"); } } catch(e) { fs = null; }
  // === engine ===
  import plug from "@/engine/PluginManager";
  // === dialog ===
  //import VariableNamingDialog from "@/engine/views/dialog/VariableNamingDialog";
  //import PianoDialog from "@/engine/views/dialog/PianoDialog";
  //import TTSDialog from "@/engine/views/dialog/TTSDialog";

  // === Node.js ===
  let exec = null; try { if (isElectron) { exec = require("child_process").exec; } } catch(e) { exec = null; }
  let os = null; try { if (isElectron) { os = require("os"); } } catch(e) { os = { platform(){ return 'linux'; } } }

  const htmlEntities = function(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const language = "en";

  var editor_interval = null;

  var myself = null;

  export default {
    components: { EditorTopbar, Multipane, MultipaneResizer },
    name: "PageEditor",
    data() {
      return {
        codegen: null,
        alertErrors: "",
        compileStep: 1,
        compileDialog: false,
        failed: false,
        stepResult: {
          "1": {
            result: true,
            msg: ""
          },
          "2": {
            result: true,
            msg: ""
          },
          "3": {
            result: true,
            msg: ""
          }
        },

        workspace: null,
        toolbox: null,
        editor_options: (this.$global && this.$global.editor) ? this.$global.editor.editor_options : {},
        variableDialog: false,
        variable_name: this.name,
        variableMessage: "Nome da variável",
        validated: false,
        variable_name_validator: value => {
          const pattern = /(?:^(uint16\s*|uint32\s*|uint8\s*|auto\s*|const\s*|unsigned\s*|signed\s*|register\s*|volatile\s*|static\s*|void\s*|short\s*|long\s*|char\s*|int\s*|float\s*|double\s*|_Bool\s*|complex\s*|return\s*)+$)|(?:\s+\*?\*?\s*)|(^[0-9])|([^_A-Za-z0-9]+)/;
          this.validated = !pattern.test(value);
          if (value == null || value == "") {
            this.validated = false;
          }
          return this.validated || "Nome de variável inválido";
        },
        musicDialog: false,
        ttsDialog: false,
        cameraDialog: false,
        video: {},
        canvas: {},
        capture: null,
        snapshotBuffer: null,
        themeColors: [
          {
            name: "blue",
            color: "#2196f3"
          },
          {
            name: "lightBlue",
            color: "#03a9f4"
          },
          {
            name: "teal",
            color: "#009688"
          },
          {
            name: "red",
            color: "#f44336"
          },
          {
            name: "orange",
            color: "#ff9800"
          },
          {
            name: "purple",
            color: "#9c27b0"
          },
          {
            name: "indigo",
            color: "#3f51b5"
          },
          {
            name: "cyan",
            color: "#00bcd4"
          },
          {
            name: "pink",
            color: "#e91e63"
          },
          {
            name: "green",
            color: "#4caf50"
          }
        ],
        lightThemeArray: ["red", "purple", "indigo", "pink"],
        darkThemeArray: ["blue", "lightBlue", "teal", "orange", "cyan", "green"]
      };
    },
    created() {
      myself = this;
      this.$global && this.$global.$on && this.$global.$on('kids-mode-change', this.onKidsModeChange);
      if (!electron || !electron.ipcRenderer) {
        return;
      }
      electron.ipcRenderer.on("edit-undo", () => {
        if (this.$global.editor.mode < 3) {
          Blockly.onKeyDown_({
            keyCode: "Z".charCodeAt(0),
            ctrlKey: true,
            target: { type: "none" }
          });
        } else {
          let cm = myself.getCm();
          cm.trigger("aaaa", "undo", "aaaa");
        }
      });
      electron.ipcRenderer.on("edit-redo", () => {
        if (this.$global.editor.mode < 3) {
          Blockly.onKeyDown_({
            keyCode: "Y".charCodeAt(0),
            ctrlKey: true,
            target: { type: "none" }
          });
        } else {
          let cm = myself.getCm();
          cm.trigger("aaaa", "redo", "aaaa");
        }
      });
      electron.ipcRenderer.on("edit-cut", () => {
        if (this.$global.editor.mode < 3) {
          Blockly.onKeyDown_({
            keyCode: "X".charCodeAt(0),
            ctrlKey: true,
            target: { type: "none" }
          });
        } else {
          document.execCommand("cut");
        }
      });
      electron.ipcRenderer.on("edit-copy", () => {

        if (process.platform === "darwin") {
          document.execCommand("copy");
        } else {
          if (this.$global.editor.mode < 3) {
            Blockly.onKeyDown_({
              keyCode: "C".charCodeAt(0),
              ctrlKey: true,
              target: { type: "none" }
            });
          } else {
            document.execCommand("copy");
          }
        }

      });
      electron.ipcRenderer.on("edit-paste", () => {

        if (process.platform === "darwin") {
          document.execCommand("paste");
        } else {
          if (this.$global.editor.mode < 3) {
            Blockly.onKeyDown_({
              keyCode: "V".charCodeAt(0),
              ctrlKey: true,
              target: { type: "none" }
            });
          } else {
            document.execCommand("paste");
          }
        }

      });
      electron.ipcRenderer.on("edit-find", () => {
        if (this.$global.editor.mode < 3) {
          Blockly.onKeyDown_({
            keyCode: "F".charCodeAt(0),
            ctrlKey: true,
            target: { type: "none" }
          });
        } else {
          let cm = myself.getCm();
          cm.trigger("aaaa", "actions.find");
        }
      });
      electron.ipcRenderer.on("edit-replace", () => {
        if (this.$global.editor.mode < 3) {
          Blockly.onKeyDown_({
            keyCode: "H".charCodeAt(0),
            ctrlKey: true,
            target: { type: "none" }
          });
        } else {
          let cm = myself.getCm();
          cm.trigger("aaaa", "editor.action.startFindReplaceAction");
        }
      });
      electron.ipcRenderer.on("clang-format", () => {
        this.clangFormat();
      });
    },
    mounted() {
      /* Monaco config */
      if (this.$global.editor.mode < 3) {
        this.$global.editor.editor_options.readOnly = true;
      } else {
        this.$global.editor.editor_options.readOnly = false;
      }

      Blockly.setLocale(En);
      Blockly.utils.getMessageArray_ = function() {
        return Blockly.Msg;
      };
      // Toolbox fallback no navegador: usar blocos padrão do Blockly
      if (!isElectron) {
        const tb = document.createElement('xml');
        tb.setAttribute('id','webToolbox');
        tb.style.display = 'none';
        tb.innerHTML = this.$global.setting.kidsMode ? this.kidsToolboxXml() : this.defaultToolboxXml();
        document.body.appendChild(tb);
        this.toolbox = tb;
      } else {
        this.toolbox = document.getElementById("toolbox");
      }
      this.workspace = Blockly.inject("blocklyDiv", {
        grid: {
          spacing: 25,
          length: 3,
          colour: "#ccc",
          snap: true
        },
        media: "./static/blockly/media/",
        //rtl: rtl,
        toolbox: this.toolbox,
        zoom: {
          controls: true,
          wheel: true,
          startScale: this.$global.setting.kidsMode ? 1.1 : 1,
          maxScale: 2,
          minScale: 0.3,
          scaleSpeed: 1.07
          //scrollbars: false
        }
      });
      this.workspace.addChangeListener(this.updatecode);
      Blockly.svgResize(this.workspace);
      this.workspace.scrollCenter();
      // override prompt function, fixed electron dialog problem
      Blockly.prompt = function(message, defaultValue, callback) {
        myself.variable_name = defaultValue;
        myself.variableMessage = message;
        myself.$refs.variableOK.$on("click", function() {
          let new_val = myself.variable_name;
          if (new_val && new_val != "" && myself.validated) {
            callback(new_val);
          } else {
            callback(null);
          }
          myself.$refs.variableOK.$off("click");
          myself.variableDialog = false;
        });
        myself.variableDialog = true;
      };
      Blockly.music = function(notes, cb) {
        if (notes) {
          myself.$refs.musicNotes.tags = notes.split(",").map(el => {
            return { text: el };
          });
        }
        myself.$refs.musicNotes.$on("result", function(n) {
          myself.musicDialog = false;
          myself.$refs.musicNotes.$off("result");
          cb(n);
        });
        myself.musicDialog = true;
      };
      Blockly.tts = function(words, cb) {
        if (words) {
          myself.$refs.ttsWords.tags = words.split(" ").map(el => {
            return { text: el };
          });
        }
        myself.$refs.ttsWords.$on("result", function(n) {
          myself.ttsDialog = false;
          myself.$refs.ttsWords.$off("result");
          cb(n);
        });
        myself.ttsDialog = true;
      };

      Blockly.camera = cb => {
        // Camera API
        this.video = this.$refs.video;
        this.capture = cb;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            window.streamCamera = stream;
            this.video.src = window.URL.createObjectURL(stream);
            //window.streamCamera =
            this.video.play();
          });
        }
        this.cameraDialog = true;
      };

      console.log("blocly mounted");
      //---- global event
      this.$global.$on("theme-change", this.onThemeChange);
      this.$global.$on("panel-resize", this.onResizePanel);
      this.$global.$on("board-change", this.onBoardChange);
      this.$global.$on("editor-mode-change", this.onEditorModeChange);
      this.$global.$on("editor-theme-change", this.onEditorThemeChange);
      this.$global.$on("editor-fontsize-change", this.onEditorFontsizeChange);

      this.$global.$on("compile-begin", this.clearError);
      this.$global.$on("compile-error", this.addError);
      //this.$global.$on("compile-success",_);
      try {
        if (this.$vuetify && this.$vuetify.theme && this.$vuetify.theme.primary === "") {
          this.$vuetify.theme.primary = "#009688";
        }
      } catch(e) {}
      let theme = (this.$vuetify && this.$vuetify.theme && this.$vuetify.theme.primary) ? this.$vuetify.theme.primary : "#009688";
      let lighter = util.ui.colorLuminance(theme, 0.2);
      document.body.getElementsByClassName(
        "blocklyToolboxDiv"
      )[0].style.backgroundColor = lighter;

      //---- render block
      this.onBoardChange(this.$global.board.board_info, true);
      //---- render editor theme
      this.onEditorThemeChange(this.$global.editor.theme);
      //---- render editor fontsize
      this.onEditorFontsizeChange(this.$global.editor.fontSize);
      //---- render editor mode change
      this.onEditorModeChange(this.$global.editor.mode, false);
      //---- load code ----//
      this.$global.editor.Blockly = Blockly;
      this.$global.editor.workspace = this.workspace;
      this.$global.editor.CodeMirror = null;
      this.$global.editor.Editor = this.getCm();
      //this.addError();

      this.detectTheme();

    },
    methods: {
      defaultToolboxXml(){
        return `
          <category name="Lógica" colour="210">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
            <block type="logic_operation"></block>
            <block type="logic_boolean"></block>
          </category>
          <category name="Laços" colour="120">
            <block type="controls_repeat_ext"></block>
            <block type="controls_whileUntil"></block>
            <block type="controls_for"></block>
          </category>
          <category name="Matemática" colour="230">
            <block type="math_number"></block>
            <block type="math_arithmetic"></block>
          </category>
          <category name="Texto" colour="160">
            <block type="text"></block>
            <block type="text_print"></block>
          </category>`;
      },
      kidsToolboxXml(){
        return `
          <category name="Início" colour="200">
            <block type="controls_repeat_ext"></block>
            <block type="text_print"></block>
          </category>
          <category name="Ações" colour="60">
            <block type="controls_if"></block>
          </category>
        `;
      },
      onKidsModeChange(){
        try {
          const tb = document.getElementById('webToolbox') || document.createElement('xml');
          tb.setAttribute('id','webToolbox');
          tb.style.display = 'none';
          tb.innerHTML = this.$global.setting.kidsMode ? this.kidsToolboxXml() : (tb.innerHTML || this.defaultToolboxXml());
          this.toolbox = tb;
          this.workspace.updateToolbox(this.toolbox);
          if (this.$global.setting.kidsMode) { this.workspace.zoomCenter(1.1); }
        } catch(e){}
      },
      clangFormat() {
        //console.log(this.$global.editor.sourceCode);
        this.$global.editor.sourceCode = reformatCode(this.$global.editor.sourceCode);
      },
      detectTheme() {
        /* Detect Theme */
        const currentThemeColor = (this.$vuetify && this.$vuetify.theme && this.$vuetify.theme.primary) ? this.$vuetify.theme.primary : "#009688";
        const getThemeName = this.themeColors.find((theme) => {
          const themeColor = theme["color"];
          return themeColor === currentThemeColor;
        }) || { name: "teal" };
        console.log(getThemeName["name"]);
        this.lightThemeArray.find(theme => theme === getThemeName["name"]) && this.cssTextLight();
        this.darkThemeArray.find(theme => theme === getThemeName["name"]) && this.cssTextDark();

        setTimeout(() => {
          this.lightThemeArray.find(theme => theme === getThemeName["name"]) && this.cssTextLight();
          this.darkThemeArray.find(theme => theme === getThemeName["name"]) && this.cssTextDark();
        }, 5000);
      },
      cssTextLight() {
        let elements = document.getElementsByClassName("blocklyTreeLabel");
        for (let i in elements) {
          if (elements.hasOwnProperty(i)) {
            elements[i].classList.add("text-white");
          }
        }
      },
      cssTextDark() {
        let elements = document.getElementsByClassName("blocklyTreeLabel");
        for (let i in elements) {
          if (elements.hasOwnProperty(i)) {
            elements[i].classList.remove("text-white");
          }
        }
      },
      snapCameraDialog() {
        this.video = this.$refs.video;
        this.canvas = this.$refs.canvas;
        this.canvas.getContext("2d").drawImage(this.video, 0, 0, 640, 480);
        this.snapshotBuffer = this.canvas.toDataURL();
        this.video.style = "display: none";
        this.canvas.style = "display: block";
      },
      refreshCameraDialog() {
        this.video = this.$refs.video;
        this.canvas = this.$refs.canvas;
        this.snapshotBuffer = null;
        this.video.style = "display: block";
        this.canvas.style = "display: none";
      },
      saveCameraDialog() {
        this.capture(this.snapshotBuffer);
        this.closeCameraDialog();
      },
      closeCameraDialog() {
        this.snapshotBuffer = null;
        this.capture = null;
        window.streamCamera.getTracks()[0].stop();
        this.refreshCameraDialog();
        this.cameraDialog = false;
      },
      getCm() {
        try {
          if ("cm" in myself.$refs) {
            if (myself.$refs.cm != undefined) {
              return myself.$refs.cm.getEditor();
            }
          }
          return false;
        } catch (e) {
          return false;
        }
      },
      onEditorFontsizeChange(value) {
        let cm = myself.getCm();
        if (cm) {
          cm.updateOptions({ fontSize: value });
          cm.layout();
        }
      },
      onEditorThemeChange(value) {
        let cm = myself.getCm();
        if (cm) {
          if (value === "vs-dark") {
            monaco.editor.setTheme("vs-dark");
          } else {
            import("monaco-themes/themes/" + value + ".json").then(data => {
              monaco.editor.defineTheme("monokai", data);
              monaco.editor.setTheme("monokai");
            });
          }
        }
      },
      async onEditorModeChange(mode, convert = false, create_new = false) {
        if (mode < 3) {
          let xml = "";
          if (
            myself.$global.editor.blockCode !== "" &&
            myself.$global.editor.blockCode !==
            "<xml xmlns=\"http://www.w3.org/1999/xhtml\"><variables></variables></xml>"
          ) {
            let text = myself.$global.editor.blockCode;
            try {
              if (Blockly.Xml && typeof Blockly.Xml.textToDom === 'function') {
                xml = Blockly.Xml.textToDom(text);
              } else {
                xml = xmlParser.parseFromString(text, 'text/xml');
              }
            } catch(e) { xml = null; }
          } else {
            let blocks = await loadBlock(myself.$global.board.board_info);
            if (blocks.initial_blocks) {
              try {
                if (Blockly.Xml && typeof Blockly.Xml.textToDom === 'function') {
                  xml = Blockly.Xml.textToDom(blocks.initial_blocks);
                } else {
                  xml = xmlParser.parseFromString(blocks.initial_blocks, 'text/xml');
                }
              } catch(e) { xml = null; }
            }
          }
          myself.workspace.clear();
          try {
            if (xml) {
              if (Blockly.Xml && typeof Blockly.Xml.domToWorkspace === 'function') {
                Blockly.Xml.domToWorkspace(xml, myself.workspace);
              } else {
                // Fallback: ignore when Xml API not present
              }
            }
          } catch(e) {}
          setTimeout(() => {
            Blockly.svgResize(this.workspace);
          }, 300);
        } else {
          //------ generate template here ------//
          const boardDirectory = `${this.$global.board.board_info.dir}`;
          const platformDir = `${util.platformDir}/${this.$global.board.board_info.platform}`;
          this.codegen = (util.requireFunc && isElectron) ? util.requireFunc(`${fs && fs.existsSync(`${boardDirectory}/codegen.js`)
            ? boardDirectory
            : platformDir}/codegen`) : null;
          if (this.codegen && typeof this.codegen.generate === 'function') {
            if (convert) {
              const respCode = this.codegen.generate(this.$global.editor.rawCode);
              myself.$global.editor.sourceCode = reformatCode(respCode.sourceCode);
            } else if (create_new) {
              const codeRes = this.codegen.generate("");
              myself.$global.editor.sourceCode = reformatCode(codeRes.sourceCode);
            }
          }
        }
        const cm = this.getCm();
        if (cm) {
          // enable editing options if needed
          // cm.updateOptions && cm.updateOptions({ readOnly: mode < 3 });
        }
      },
      onBoardChange: async function(boardInfo, first_init = false) {
        //reload plugin
        console.log("board changed resender toolbox");
        this.$global.plugin.pluginInfo = plug.loadPlugin(this.$global.board.board_info);
        try {
          if (typeof window !== 'undefined' && window.initBlockly && typeof window.initBlockly === 'function') {
            window.initBlockly(boardInfo);
          }
        } catch (e) {}
        let blocks = await loadBlock(boardInfo);
        let stringBlock = "";
        if ("blocks" in blocks) {
          //render extended block
          stringBlock += renderBlock(blocks.blocks);
        }
        if ("base_blocks" in blocks) {
          //render block base from platform
          stringBlock += renderBlock(blocks.base_blocks);
        }
        // render plugin blocks
        stringBlock += loadAndRenderPluginsBlock(
          Blockly,
          boardInfo,
          this.$global.plugin.pluginInfo
        );
        // TODO : render platform block
        let inner = stringBlock || "";
        if (!inner || inner.indexOf('<category') === -1) {
          // fallback para web
          const tb = document.getElementById('webToolbox') || document.createElement('xml');
          tb.setAttribute('id','webToolbox');
          tb.style.display = 'none';
          tb.innerHTML = this.$global.setting.kidsMode ? this.kidsToolboxXml() : this.defaultToolboxXml();
          document.body.contains(tb) || document.body.appendChild(tb);
          this.toolbox = tb;
        } else {
          const xmlEl = document.createElement('xml');
          xmlEl.setAttribute('id','toolbox');
          xmlEl.style.display = 'none';
          xmlEl.innerHTML = inner;
          this.toolbox = xmlEl;
        }
        this.workspace.updateToolbox(this.toolbox);
        //============== render mode 3 source code
        const boardDirectory = `${this.$global.board.board_info.dir}`;
        const platformDir = `${util.platformDir}/${this.$global.board.board_info.platform}`;
        this.codegen = (util.requireFunc && isElectron) ? util.requireFunc(`${fs && fs.existsSync(`${boardDirectory}/codegen.js`)
          ? boardDirectory
          : platformDir}/codegen`) : null;

        let codeRes = { sourceCode: this.$global.editor.sourceCode || "" };
        if (!(first_init && global.config && global.config.file) && this.codegen && typeof this.codegen.generate === 'function') {
          codeRes = this.codegen.generate("");
        }
        myself.$global.editor.sourceCode = reformatCode(codeRes.sourceCode || "");
        //==============
        this.detectTheme();
      },
      onThemeChange(theme) {
        document.body.getElementsByClassName(
          "blocklyToolboxDiv"
        )[0].style.backgroundColor = util.ui.colorLuminance(theme, 0.2);
      },
      onResizePanel(pane, container, size) {
        Blockly.svgResize(this.workspace);
        console.log("editor resized");
      },
      updatecode(e) {
        // real time reformat mode
        if (!this.workspace || !javascriptGenerator) { return; }
        if (e.type != Blockly.Events.UI) {
          this.$global.editor.rawCode = javascriptGenerator.workspaceToCode(this.workspace);
          var xml = Blockly.Xml.domToText(
            Blockly.Xml.workspaceToDom(this.workspace)
          );
          this.$global.editor.blockCode = xml;
        }
        if (!this.$global.editor.rawCodeMode && this.$global.editor.mode === 2 && this.codegen && typeof this.codegen.generate === 'function') {
          let prev = reformatCode(this.codegen.generate(this.$global.editor.rawCode).sourceCode);
          this.$global.editor.previewSourceCode = prev;
        }
        /*else{
                if(e.element == 'selected'){
                    if(e.newValue != null){ //selected block
                        var block = this.workspace.getBlockById(e.newValue);
                        var code = Blockly.JavaScript.blockToCode(block);
                    }else{ //deselect block
                        console.log("deselected block");
                    }
                }
            }*/
      },
      clearError() {
        let cm = this.getCm();
        monaco.editor.setModelMarkers(this.getCm().getModel(), "error", []);
      },
      addError: function(errors) {
        try {
          let cm = this.getCm();
          this.clearError();
          if (!Array.isArray(errors)) {
            return;
          }
          if (errors.length === 0) {
            return;
          }
          let markers = [];
          errors.forEach(err => {
            if (typeof err !== "string") {
              return;
            }
            let rex = /^([0-9]+):([0-9]+):(.*)/g;
            let res = rex.exec(err);
            if (!res || res.length !== 4) {
              return;
            }
            let line = parseInt(res[1]);
            let col = parseInt(res[2]);
            let marker = {
              startLineNumber: line,
              startColumn: 0,
              endLineNumber: line,
              endColumn: 9999,
              message: htmlEntities(err),
              severity: monaco.MarkerSeverity.Error
            };
            markers.push(marker);
          });
          monaco.editor.setModelMarkers(this.getCm().getModel(), "error", markers);
        } catch (e) {
          console.log(e);
        }
      }
    }
  };
</script>

<style>
    .editor {
        width: 100%;
        height: 100%;
    }

    .line-error {
        background: rgba(251, 0, 26, 0.34) !important;
        color: #fff7fb !important;
    }

    .vertical-panes-editor {
        width: 100%;
        height: 100%; /* minus header and footer */
        border: 1px solid #ccc;
    }

    .vertical-panes-editor > .pane {
        width: 25%;
    }

    .vertical-panes > .pane {
        text-align: left;
        overflow: hidden;
        background: #fff;
    }

    .vertical-panes > .pane ~ .pane {
        border-left: 4px solid #ccc;
    }

    :root{
        --kb-surface: #0f172a; /* slate-900 */
        --kb-surface-2: #111827; /* gray-900 */
        --kb-border: rgba(255,255,255,.08);
        --kb-accent: #60a5fa; /* blue-400 */
        --kb-accent-2: #93c5fd; /* blue-300 */
        --kb-muted: #94a3b8; /* slate-400 */
    }

    .blocklyToolboxDiv {
        overflow-y: auto !important;
        overflow-x: hidden;
        position: absolute;
        inset: 0 auto 0 0;
        width: 240px;
        background: linear-gradient(180deg, var(--kb-surface-2), var(--kb-surface));
        border-right: 1px solid var(--kb-border);
        color: #e5e7eb;
        z-index: 70;
        -webkit-tap-highlight-color: transparent;
    }
    .blocklyTreeRoot { padding: 8px 8px 80px 8px !important; }
    .blocklyTreeRow {
        border-radius: 10px;
        margin: 6px 6px;
        padding: 8px 12px !important;
        height: auto !important;
        line-height: 20px !important;
        color: #e5e7eb !important;
        background: transparent !important;
        transition: background .15s ease, color .15s ease;
    }
    .blocklyTreeRow:hover { background: rgba(255,255,255,.06) !important; }
    .blocklyTreeRow.blocklyTreeSelected {
        background: rgba(96,165,250,.18) !important;
        color: var(--kb-accent-2) !important;
    }
    .blocklyTreeIcon { display: none !important; }
    .blocklyTreeLabel { font-weight: 600; letter-spacing: .2px; }

    .layout-v > .multipane-resizer {
        width: 5px;
        height: 100%;
        margin-left: 0px;
        left: 0px;
        background-color: #bbb;
    }

    .CodeMirror {
        border: 1px solid #eee;
        height: 100%;
    }

    /* minus header and footer */
    .blocklyToolboxDiv { overflow: auto; }

    .blocklyHtmlInput {
        background-color: white !important;
    }

    .CodeMirror-advanced-dialog {
        width: 400px;
        display: block;
        position: absolute;
        z-index: 999;
        background-color: #333;
        padding: 6px;
        right: 30px;
        top: 0px;
        color: wheat;
        -webkit-box-shadow: 2px 2px 6px 1px #666;
        -moz-box-shadow: 2px 2px 6px 1px #666;
        box-shadow: 2px 2px 6px 1px #666;
    }

    .CodeMirror-advanced-dialog input {
        border: none;
        outline: none;
        background: transparent;
        width: 5em;
        background-color: #555;
        color: wheat;
    }

    .CodeMirror-advanced-dialog button {
        font-size: 70%;
    }

    .CodeMirror-advanced-dialog .row {
        display: flex;
        width: 100%;
        align-items: center;
    }

    .CodeMirror-advanced-dialog input[type="text"] {
        display: inline-block;
        margin: 10px;
        flex: 1 1 auto;
    }

    .CodeMirror-advanced-dialog input::placeholder {
        /* Chrome, Firefox, Opera, Safari 10.1+ */
        color: #999;
        opacity: 1; /* Firefox */
    }

    .CodeMirror-search-hint {
        display: block;
        font-style: italic;
        flex: 0 0 100%;
    }
</style>

<!--<div id="blocklyDiv" style="position:fixed; width:100%; height:95%;">
</div>
<xml id="toolbox" ref=toolbox style="display: none">
    <category name='Basic' icon="./static/icons/SVG/c1.svg">
        <block type="controls_if"></block>
        <block type="text"></block>
        <block type="text_print"></block>
    </category>
</xml>-->

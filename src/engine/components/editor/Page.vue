<template>
  <div class="modern-editor-page">
      <ModernEditorToolbar
        :mode="currentMode"
          @new-file="$global.$emit('file-new')"
          @open-file="$global.$emit('file-open')"
          @save-file="$global.$emit('file-save')"
        @set-mode="onModeChange"
      />
      
              <div class="modern-editor-content">
          <!-- Mode 1: Blockly Only -->
          <div 
            class="editor-mode-single"
            :style="{ display: currentMode === 1 ? 'flex' : 'none' }"
          >
            <div id="blocklyDiv" class="modern-blockly-workspace"></div>
          </div>

          <!-- Mode 2: Blockly + Code (Resizable) -->
        <multipane
            class="editor-mode-split"
            layout="vertical"
            @paneResizeStop="onEditorPaneResize"
            :style="{ display: currentMode === 2 ? 'flex' : 'none' }"
          >
            <!-- Blockly Panel -->
            <div class="blockly-panel" :style="{ minWidth: '300px', width: blocklyPanelWidth + 'px' }">
              <div class="panel-header">
                <i class="fa fa-puzzle-piece"></i>
                <span>Blocos Visuais</span>
                <div class="panel-header__actions">
                  <button 
                    class="panel-action"
                    @click="generateCodeFromBlocks"
                    title="Gerar Código C++"
                  >
                    <i class="fa fa-arrow-right"></i>
                  </button>
                  <button 
                    class="panel-action"
                    @click="clearWorkspace"
                    title="Limpar Workspace"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </div>
              <div id="blocklyDiv" class="modern-blockly-workspace"></div>
            </div>
            
            <!-- Resizer -->
            <multipane-resizer class="modern-panel-resizer"></multipane-resizer>
            
            <!-- Code Editor Panel -->
            <div class="code-panel" style="flex: 1; min-width: 300px;">
              <div class="panel-header">
                <i class="fa fa-code"></i>
                <span>Editor de Código C++</span>
                <div class="panel-header__actions">
                  <button 
                    class="panel-action"
                    @click="formatCode"
                    title="Formatar Código"
                  >
                    <i class="fa fa-indent"></i>
                  </button>
                  <button 
                    class="panel-action"
                    @click="validateCode"
                    title="Validar Sintaxe"
                  >
                    <i class="fa fa-check"></i>
                  </button>
                  <button 
                    class="panel-action"
                    @click="copyCode"
                    title="Copiar Código"
                  >
                    <i class="fa fa-copy"></i>
                  </button>
                </div>
              </div>
              <div class="modern-code-editor-container">
                <MonacoEditor
                  ref="monacoEditor"
                  v-model="$global.editor.sourceCode"
                  language="cpp"
                  theme="vs-dark"
                  :options="monacoOptions"
                  @change="onCodeChange"
                />
              </div>
            </div>
          </multipane>

          <!-- Mode 3: Code Only -->
          <div 
            class="editor-mode-single"
            :style="{ display: currentMode === 3 ? 'flex' : 'none' }"
          >
            <div class="panel-header">
              <i class="fa fa-code"></i>
              <span>Editor de Código Arduino</span>
              <div class="panel-header__actions">
                <button 
                  class="panel-action"
                  @click="newArduinoSketch"
                  title="Novo Sketch"
                >
                  <i class="fa fa-file-o"></i>
                </button>
                <button 
                  class="panel-action"
                  @click="formatCode"
                  title="Formatar Código"
                >
                  <i class="fa fa-indent"></i>
                </button>
                <button 
                  class="panel-action"
                  @click="validateCode"
                  title="Validar Sintaxe"
                >
                  <i class="fa fa-check"></i>
                </button>
                <button 
                  class="panel-action"
                  @click="copyCode"
                  title="Copiar Código"
                >
                  <i class="fa fa-copy"></i>
                </button>
                <button 
                  class="panel-action"
                  @click="compileCode"
                  title="Compilar"
                >
                  <i class="fa fa-play"></i>
                </button>
              </div>
            </div>
            <div class="modern-code-editor-container">
              <MonacoEditor
                ref="monacoEditor"
                v-model="$global.editor.sourceCode"
                language="cpp"
                theme="vs-dark"
                :options="monacoOptions"
                @change="onCodeChange"
              />
            </div>
          </div>
        </div>
            <xml id="toolbox" ref="toolbox" style="display: none">
              <category name="Básico" colour="160" icon="/static/icons/SVG/c1.svg">
                    <block type="basic_led16x8"></block>
                </category>
            </xml>

          <!-- Variable Dialog - Hidden for now, replaced by modern panel -->
          <div v-if="false" style="display: none;">
              <!-- Removed old variable dialog -->
          </div>

          <!-- Camera Dialog - Disabled to prevent UI issues -->
          <div v-if="false" style="display: none;">
              <!-- Removed camera dialog that was causing bottom bar -->
                                </div>

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
  import ModernEditorToolbar from "@/engine/components/modern/ModernEditorToolbar.vue";
  import ModernBlocklyToolbox from "@/engine/components/modern/ModernBlocklyToolbox.vue";
  import ModernPanelLayout from "@/engine/components/modern/ModernPanelLayout.vue";
  import ModernResizablePanel from "@/engine/components/modern/ModernResizablePanel.vue";
  import { createTheme } from "@/engine/blockly/theme";
  import { buildToolboxXml, filterToolboxByQuery } from "@/engine/blockly/toolbox";
  import { defineAsyncComponent } from 'vue';
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

  // Registrar blocos customizados mínimos para web (ex.: ESP32)
  const ensureWebCustomBlocks = function(){
    console.log('Defining custom blocks for web...');
    try {
      if (!Blockly || !Blockly.Blocks) { return; }
      // Define all blocks here in ensureWebCustomBlocks
      console.log('Defining ALL custom blocks...');
      
      // ESP32 Blocks
      if (!Blockly.Blocks["gpio_set_mode"]) {
        console.log('Creating gpio_set_mode in ensureWebCustomBlocks');
        Blockly.Blocks["gpio_set_mode"] = {
          init: function(){
            this.appendDummyInput()
                .appendField("configurar pino")
                .appendField(new Blockly.FieldNumber(13, 0, 39), "PIN")
                .appendField("como")
                .appendField(new Blockly.FieldDropdown([["saída","OUTPUT"], ["entrada","INPUT"]]), "MODE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#A65C81');
            this.setTooltip("Configura pino como entrada ou saída"); 
            this.setHelpUrl("");
          }
        };
      }
      
      if (!Blockly.Blocks["gpio_digital_write"]) {
        console.log('Creating gpio_digital_write in ensureWebCustomBlocks');
        Blockly.Blocks["gpio_digital_write"] = {
          init: function(){
            this.appendDummyInput()
                .appendField("escrever pino")
                .appendField(new Blockly.FieldNumber(13, 0, 39), "PIN")
                .appendField("valor")
                .appendField(new Blockly.FieldDropdown([["HIGH","HIGH"], ["LOW","LOW"]]), "VALUE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#A65C81');
            this.setTooltip("Escreve HIGH ou LOW em pino digital"); 
            this.setHelpUrl("");
          }
        };
      }
      
      console.log('Sensor and actuator blocks will be defined in mounted');
      console.log('All custom blocks defined in ensureWebCustomBlocks');
    } catch(e) {
      console.error('Error defining custom blocks:', e);
    }
  };

  // Utilitário: download de arquivo no navegador
  const triggerDownload = function(filename, content){
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; document.body.appendChild(a); a.click();
      setTimeout(()=>{ URL.revokeObjectURL(url); document.body.removeChild(a); }, 0);
    } catch(e) {}
  };

  var myself = null;

  export default {

    components: { 
      EditorTopbar, 
      ModernEditorToolbar,
      ModernBlocklyToolbox,
      ModernPanelLayout,
      ModernResizablePanel,
      Multipane, 
      MultipaneResizer,
      MonacoEditor: defineAsyncComponent(() => import('@/engine/components/common/MonacoEditor.vue'))
    },
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

        nativeToolboxConfig: {
          kind: 'categoryToolbox',
          contents: [
            {
              kind: 'category',
              name: 'Logic',
              colour: '#5C81A6',
              contents: [
                { kind: 'block', type: 'controls_if' },
                { kind: 'block', type: 'logic_compare' },
                { kind: 'block', type: 'logic_operation' },
                { kind: 'block', type: 'logic_negate' },
                { kind: 'block', type: 'logic_boolean' }
              ]
            },
            {
              kind: 'category',
              name: 'Loops',
              colour: '#5CA65C',
              contents: [
                { kind: 'block', type: 'controls_repeat_ext' },
                { kind: 'block', type: 'controls_whileUntil' },
                { kind: 'block', type: 'controls_for' },
                { kind: 'block', type: 'controls_forEach' }
              ]
            },
            {
              kind: 'category',
              name: 'Math',
              colour: '#5C68A6',
              contents: [
                { kind: 'block', type: 'math_number' },
                { kind: 'block', type: 'math_arithmetic' },
                { kind: 'block', type: 'math_single' },
                { kind: 'block', type: 'math_trig' }
              ]
            },
            {
              kind: 'category',
              name: 'Text',
              colour: '#5CA68D',
              contents: [
                { kind: 'block', type: 'text' },
                { kind: 'block', type: 'text_join' },
                { kind: 'block', type: 'text_append' },
                { kind: 'block', type: 'text_length' }
              ]
            },
            {
              kind: 'category',
              name: 'ESP32',
              colour: '#A65C81',
              contents: [
                { kind: 'block', type: 'gpio_set_mode' },
                { kind: 'block', type: 'gpio_digital_write' },
                { kind: 'block', type: 'gpio_digital_read' },
                { kind: 'block', type: 'gpio_analog_read' },
                { kind: 'block', type: 'wifi_begin' },
                { kind: 'block', type: 'wifi_status' },
                { kind: 'block', type: 'serial_begin' },
                { kind: 'block', type: 'serial_print' },
                { kind: 'block', type: 'delay' },
                { kind: 'block', type: 'pin_mode' }
              ]
            },
            {
              kind: 'category',
              name: 'Sensores',
              colour: '#FF6B6B',
              contents: [
                { kind: 'block', type: 'dht_read' },
                { kind: 'block', type: 'ultrasonic_read' },
                { kind: 'block', type: 'ldr_read' },
                { kind: 'block', type: 'pir_read' },
                { kind: 'block', type: 'temp_read' }
              ]
            },
            {
              kind: 'category',
              name: 'Atuadores',
              colour: '#4ECDC4',
              contents: [
                { kind: 'block', type: 'servo_write' },
                { kind: 'block', type: 'led_write' },
                { kind: 'block', type: 'buzzer_tone' },
                { kind: 'block', type: 'motor_control' },
                { kind: 'block', type: 'relay_control' }
              ]
            }
          ]
        },
        monacoOptions: {
          automaticLayout: true,
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          theme: 'vs-dark'
        },
        variableDialog: false, // Keep closed
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
        cameraDialog: false, // Keep closed
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
        blocklyPanelWidth: 500, // Default width for blockly panel in split mode
        saveTimeout: null, // For throttled saving
        lightThemeArray: ["red", "purple", "indigo", "pink"],
        darkThemeArray: ["blue", "lightBlue", "teal", "orange", "cyan", "green"]
      };
    },
    computed: {
      currentMode() {
        return this.$global?.editor?.mode || 1;
      },
      editorPanels() {
        const mode = this.$global.editor.mode;
        const panels = [];
        
        // Blockly Panel (modes 1 and 2)
        if (mode <= 2) {
          panels.push({
            id: 'blockly',
            title: 'Blocos Visuais',
            icon: 'fa-puzzle-piece',
            size: mode === 1 ? '100%' : '60%',
            minSize: 300,
            resizable: mode === 2,
            collapsible: mode === 2,
            storageKey: 'blockly-panel'
          });
        }
        
        // Code Editor Panel (modes 2 and 3)
        if (mode >= 2) {
          panels.push({
            id: 'code',
            title: 'Editor de Código',
            icon: 'fa-code',
            size: mode === 3 ? '100%' : '40%',
            minSize: 200,
            resizable: mode === 2,
            collapsible: mode === 2,
            storageKey: 'code-panel'
          });
        }
        
        return panels;
      }
    },
    watch: {
      currentMode(newMode, oldMode) {
        console.log(`Watch: Mode changed from ${oldMode} to ${newMode}`);
        // Let CSS handle the display, no complex logic here
      }
    },
    created() {
      myself = this;
      
      // Load saved panel width
      try {
        const saved = localStorage.getItem('blockly-panel-width');
        if (saved) {
          this.blocklyPanelWidth = parseInt(saved, 10);
        }
      } catch(e) {}
      
      this.$global && this.$global.$on && this.$global.$on('kids-mode-change', this.onKidsModeChange);
      // Handlers web: novo/abrir/salvar
      try {
        this.$global.$on && this.$global.$on('file-new', ()=>{
          this.$global.editor.blockCode = '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables></xml>';
          this.$global.editor.rawCode = '';
          this.$global.editor.sourceCode = '';
          this.onEditorModeChange(this.$global.editor.mode, false, true);
        });
        this.$global.$on && this.$global.$on('file-save', ()=>{
          const mode = this.$global.editor.mode;
          if (mode < 3) {
            const xml = this.$global.editor.blockCode || '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables></xml>';
            const b64 = (typeof btoa === 'function') ? btoa(unescape(encodeURIComponent(xml))) : xml;
            triggerDownload('project.bly', b64);
          } else {
            triggerDownload('sketch.ino', this.$global.editor.sourceCode || '');
          }
        });
        this.$global.$on && this.$global.$on('file-open', async ()=>{
          try {
            const input = document.createElement('input'); input.type = 'file'; input.accept = '.bly,.ino,.xml,.txt';
            input.onchange = async () => {
              const file = input.files && input.files[0]; if (!file) return;
              const text = await file.text();
              if (file.name.endsWith('.bly')) {
                try { this.$global.editor.blockCode = decodeURIComponent(escape(atob(text))); } catch(_) { this.$global.editor.blockCode = text; }
                this.$global.editor.mode = 1; this.$global.$emit('editor-mode-change', 1, false, false);
              } else if (file.name.endsWith('.ino')) {
                this.$global.editor.sourceCode = text; this.$global.editor.mode = 3; this.$global.$emit('editor-mode-change', 3, false, false);
              } else if (file.name.endsWith('.xml')) {
                this.$global.editor.blockCode = text; this.$global.editor.mode = 1; this.$global.$emit('editor-mode-change', 1, false, false);
              } else {
                this.$global.editor.sourceCode = text; this.$global.editor.mode = 3; this.$global.$emit('editor-mode-change', 3, false, false);
              }
            };
            input.click();
          } catch(e) {}
        });
      } catch(e) {}
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
      console.log('Page.vue mounted, current mode:', this.$global.editor.mode);
      
      /* Monaco config */
      if (this.$global.editor.mode < 3) {
        this.$global.editor.editor_options.readOnly = true;
      } else {
        this.$global.editor.editor_options.readOnly = false;
      }
      
      // First, ensure all custom blocks are defined
      ensureWebCustomBlocks();
      
      // Add missing blocks after Blockly is loaded
      this.addMissingBlocks();
      
      // Initialize Blockly if in blockly modes
      if (this.$global.editor.mode <= 2) {
        this.$nextTick(() => {
          this.initializeBlocklyFromMounted();
        });
      }

      Blockly.setLocale(En);
      try { Blockly.setTheme(createTheme(!!(this.$vuetify && this.$vuetify.dark))); } catch(e) {}
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
        toolbox: this.nativeToolboxConfig,
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
      
      // Apply modern theme and register category styles
      try {
        // Check if theme is already registered
        const themeId = 'kbide-modern-' + Date.now();
        
        const modernTheme = Blockly.Theme.defineTheme(themeId, {
          name: themeId,
          base: Blockly.Themes.Classic,
          categoryStyles: {
            logic_category: { colour: '#5C81A6' },
            loop_category: { colour: '#5CA65C' },
            math_category: { colour: '#5C68A6' },
            text_category: { colour: '#5CA68D' },
            esp32_category: { colour: '#A65C81' },
            sensor_category: { colour: '#FF6B6B' },
            actuator_category: { colour: '#4ECDC4' },
          },
          blockStyles: {
            logic_blocks: { colourPrimary: '#5C81A6' },
            loop_blocks: { colourPrimary: '#5CA65C' },
            math_blocks: { colourPrimary: '#5C68A6' },
            text_blocks: { colourPrimary: '#5CA68D' },
            esp32_blocks: { colourPrimary: '#A65C81' },
            sensor_blocks: { colourPrimary: '#FF6B6B' },
            actuator_blocks: { colourPrimary: '#4ECDC4' },
          },
          componentStyles: {
            workspaceBackgroundColour: '#0f172a',
            toolboxBackgroundColour: '#1e293b',
            toolboxForegroundColour: '#e2e8f0',
            flyoutBackgroundColour: '#334155',
            flyoutForegroundColour: '#e2e8f0',
            flyoutOpacity: 0.95,
            scrollbarColour: '#475569',
            insertionMarkerColour: '#3b82f6',
            insertionMarkerOpacity: 0.3,
            cursorColour: '#e2e8f0'
          }
        });
        
        this.workspace.setTheme(modernTheme);
      } catch(e) {
        console.warn('Failed to apply modern theme:', e);
      }
      
      Blockly.svgResize(this.workspace);
      this.workspace.scrollCenter();
      // override prompt function - use browser prompt instead of dialog
      Blockly.prompt = function(message, defaultValue, callback) {
        try {
          const result = window.prompt(message, defaultValue);
          callback(result);
        } catch(e) {
            callback(null);
          }
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
        // Camera API - disabled for now, use modern camera component instead
        console.log('Camera function called but disabled');
        if (cb) cb(null); // Return null to prevent errors
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

      // Registrar blocos web antes de renderizar toolbox
      ensureWebCustomBlocks();
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
      setTimeout(()=> this.highlightToolbox(), 0);

      // Serialização moderna: carregar de storage se existir
      try {
        const saved = localStorage.getItem('kb_project_ws');
        if (saved) {
          const state = JSON.parse(saved);
          if (Blockly.serialization && Blockly.serialization.workspaces && typeof Blockly.serialization.workspaces.load === 'function') {
            Blockly.serialization.workspaces.load(state, this.workspace);
          }
        }
      } catch(e) {}

    },
    beforeUnmount() {
      // Cleanup workspace to prevent connection errors
      try {
        if (this.workspace) {
          // Remove change listener to prevent memory leaks
          this.workspace.removeChangeListener(this.updatecode);
          
          // Clear workspace safely
          this.workspace.clear();
          
          // Dispose of the workspace
          if (typeof this.workspace.dispose === 'function') {
            this.workspace.dispose();
          }
          
          this.workspace = null;
        }
      } catch (e) {
        console.warn('Error during workspace cleanup:', e);
      }
    },
    methods: {


      getMainEditorStyle() {
        const mode = this.$global.editor.mode;
        if (mode === 1) {
          return { flex: 1, display: 'flex', flexDirection: 'column' };
        } else if (mode === 2) {
          return { flex: 1, display: 'flex' };
        } else {
          return { flex: 1, display: 'flex', flexDirection: 'column' };
        }
      },
      onCodeChange() {
        if (this.$global.editor.mode >= 2) {
          try {
            // In mixed mode, update the raw code but don't regenerate from blocks
            // This allows manual code editing alongside blocks
            console.log('Code changed manually in mixed mode');
            
            // Save the manually edited code
            if (this.$global.editor.mode === 3) {
              // Pure code mode - just save
              localStorage.setItem('kb_manual_code', this.$global.editor.sourceCode);
            } else if (this.$global.editor.mode === 2) {
              // Mixed mode - allow manual editing but preserve blocks
              localStorage.setItem('kb_mixed_code', this.$global.editor.sourceCode);
            }
          } catch(e) {
            console.warn('Error handling code change:', e);
          }
        }
      },
      onPanelResize({ index, size, direction }) {
        console.log(`Panel ${index} resized to ${size}px (${direction})`);
        // You can add custom logic here for specific panels
      },
      onPanelCollapse(index) {
        console.log(`Panel ${index} collapsed`);
        // Handle panel collapse logic
      },
      onPanelExpand(index) {
        console.log(`Panel ${index} expanded`);
        // Handle panel expand logic
      },
      onEditorPaneResize(pane, container, size) {
        // Update blockly panel width when resized
        if (pane && pane.style && pane.style.width) {
          const newWidth = parseInt(pane.style.width, 10);
          this.blocklyPanelWidth = Math.max(300, Math.min(800, newWidth));
          
          // Save to localStorage
          try {
            localStorage.setItem('blockly-panel-width', String(this.blocklyPanelWidth));
          } catch(e) {}
          
          // Trigger Blockly resize
          setTimeout(() => {
            if (this.workspace && this.workspace.resizeContents) {
              this.workspace.resizeContents();
            }
          }, 100);
        }
      },
      highlightToolbox(){
        try {
          const q = (this.toolboxSearch || '').trim().toLowerCase();
          const labels = document.querySelectorAll('.blocklyToolboxDiv .blocklyTreeLabel');
          labels.forEach((el)=>{
            const node = el;
            const raw = (node.getAttribute('data-raw') || node.textContent || '').toString();
            if (!node.getAttribute('data-raw')) { node.setAttribute('data-raw', raw); }
            if (!q) { node.innerHTML = raw; return; }
            const idx = raw.toLowerCase().indexOf(q);
            if (idx === -1) { node.innerHTML = raw; return; }
            const before = raw.substring(0, idx);
            const match = raw.substring(idx, idx + q.length);
            const after = raw.substring(idx + q.length);
            node.innerHTML = `${before}<span class="kb-hl">${match}</span>${after}`;
          });
        } catch(e) {}
      },
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
          try {
            if (this.workspace && this.toolbox) {
              this.workspace.updateToolbox(this.toolbox);
            }
          } catch (e) {
            console.warn('Error updating toolbox:', e);
          }
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
        // Minimal mode change handler to prevent freezing
        console.log(`onEditorModeChange called for mode ${mode} - doing minimal work`);
        
        if (mode === 3) {
          // Code mode: ensure we have template code
          if (!this.$global.editor.sourceCode || create_new) {
            this.$global.editor.sourceCode = `// Sketch Arduino
#include <Arduino.h>

void setup() {
  Serial.begin(115200);
  // Configuração inicial aqui
}

void loop() {
  // Código principal aqui
  delay(1000);
}`;
          }
        }
        
        console.log(`onEditorModeChange completed for mode ${mode}`);
      },
      onBoardChange: async function(boardInfo, first_init = false) {
        //reload plugin
        console.log("board changed resender toolbox");
        this.$global.plugin.pluginInfo = this.$engine.pluginManager.loadPlugin(this.$global.board.board_info);
        try {
          if (typeof window !== 'undefined' && window.initBlockly && typeof window.initBlockly === 'function') {
            window.initBlockly(boardInfo);
          }
        } catch (e) {}
        let blocks = await loadBlock(boardInfo);
        let stringBlock = "";
        try {
          const data = { categories: [] };
          if ("blocks" in blocks) { data.categories = data.categories.concat(blocks.blocks); }
          if ("base_blocks" in blocks) { data.categories = data.categories.concat(blocks.base_blocks); }
          this.toolboxData = data;
          const filtered = filterToolboxByQuery(data, this.toolboxSearch || "");
          stringBlock = buildToolboxXml(filtered).replace(/^<xml[^>]*>|<\/xml>$/g, '');
        } catch(e) {}
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
        try {
          if (this.workspace && this.toolbox) {
            this.workspace.updateToolbox(this.toolbox);
          }
        } catch (e) {
          console.warn('Error updating toolbox in onBoardChange:', e);
        }
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
        try {
          if (this.workspace && this.workspace.getCanvas) {
        Blockly.svgResize(this.workspace);
        console.log("editor resized");
          }
        } catch(e) {
          console.warn("Error resizing editor:", e);
        }
      },
      updatecode(e) {
        // Simplified updatecode to prevent freezing during drag
        if (!this.workspace || !javascriptGenerator) { return; }
        
        // Skip UI events and drag-related events to prevent freezing
        if (e && (e.type === Blockly.Events.UI || 
                 e.type === 'drag' || 
                 e.type === 'ui' ||
                 e.type === 'selected' ||
                 e.type === 'click')) {
          return; // Skip these events to prevent freezing during drag
        }
        
        try {
          // Very conservative approach - only update on specific events
          if (!e || e.type === Blockly.Events.BLOCK_CREATE || e.type === Blockly.Events.BLOCK_DELETE) {
            // Only generate code for create/delete, not for move/drag
          this.$global.editor.rawCode = javascriptGenerator.workspaceToCode(this.workspace);
            
            // Throttled save only
            this.throttledSave();
          }
        } catch(error) {
          console.warn('Error in updatecode:', error);
        }
      },
      generateArduinoCode(rawCode) {
        // Convert JavaScript-like code from Blockly to Arduino C++
        if (!rawCode || rawCode.trim() === '') {
          return `// Código gerado automaticamente do Blockly
#include <Arduino.h>

void setup() {
  Serial.begin(115200);
  // Inicialização aqui
}

void loop() {
  // Arraste blocos para gerar código aqui
  delay(1000);
}`;
        }
        
        let setupCode = '';
        let loopCode = '';
        let includeCode = '#include <Arduino.h>\n';
        let variableCode = '';
        
        // Process the generated code line by line
        const lines = rawCode.split('\n');
        
        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('//')) {
            // Keep comments
            loopCode += `  ${trimmed}\n`;
            return;
          }
          
          // Convert specific function calls
          if (trimmed.includes('pinMode(')) {
            // pinMode calls go to setup
            setupCode += `  ${trimmed}\n`;
          } else if (trimmed.includes('digitalWrite(') || 
                    trimmed.includes('digitalRead(') ||
                    trimmed.includes('analogRead(') ||
                    trimmed.includes('delay(') ||
                    trimmed.includes('Serial.')) {
            // These go to loop
            loopCode += `  ${trimmed}\n`;
          } else if (trimmed.startsWith('var ') || trimmed.includes(' = ')) {
            // Variable declarations
            const cppVar = this.convertVariableDeclaration(trimmed);
            if (cppVar) {
              variableCode += `${cppVar}\n`;
            }
          } else if (trimmed.includes('if (') || 
                    trimmed.includes('for (') ||
                    trimmed.includes('while (')) {
            // Control structures
            loopCode += `  ${trimmed}\n`;
          } else {
            // Other code goes to loop
            loopCode += `  ${trimmed}\n`;
          }
        });
        
        // Build final Arduino code
        let finalCode = includeCode + '\n';
        
        if (variableCode) {
          finalCode += '// Variáveis globais\n' + variableCode + '\n';
        }
        
        finalCode += 'void setup() {\n';
        finalCode += '  Serial.begin(115200);\n';
        finalCode += setupCode || '  // Configuração inicial\n';
        finalCode += '}\n\n';
        
        finalCode += 'void loop() {\n';
        finalCode += loopCode || '  // Código principal\n  delay(1000);\n';
        finalCode += '}\n';
        
        return finalCode;
      },
      convertVariableDeclaration(jsLine) {
        // Convert JavaScript variable declarations to C++
        const varMatch = jsLine.match(/var\s+(\w+)\s*=\s*(.+);?/);
        if (varMatch) {
          const varName = varMatch[1];
          const varValue = varMatch[2];
          
          // Determine type based on value
          if (varValue === 'true' || varValue === 'false') {
            return `bool ${varName} = ${varValue};`;
          } else if (varValue.match(/^\d+$/)) {
            return `int ${varName} = ${varValue};`;
          } else if (varValue.match(/^\d*\.\d+$/)) {
            return `float ${varName} = ${varValue};`;
          } else if (varValue.startsWith('"') && varValue.endsWith('"')) {
            return `String ${varName} = ${varValue};`;
          } else {
            return `auto ${varName} = ${varValue};`;
          }
        }
        return null;
      },
      onModeChange(mode) {
        console.log(`Simple mode change to: ${mode}`);
        
        // Just update the mode, let Vue reactivity handle the rest
        this.$global.editor.mode = mode;
        
        console.log(`Mode updated to ${mode}`);
      },
      throttledSave() {
        // Throttle saving to prevent excessive writes during drag operations
        if (this.saveTimeout) {
          clearTimeout(this.saveTimeout);
        }
        
        this.saveTimeout = setTimeout(() => {
          try {
            if (Blockly.serialization && Blockly.serialization.workspaces && typeof Blockly.serialization.workspaces.save === 'function') {
              const state = Blockly.serialization.workspaces.save(this.workspace);
              localStorage.setItem('kb_project_ws', JSON.stringify(state));
            } else {
              var xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(this.workspace));
          this.$global.editor.blockCode = xml;
        }
          } catch(e) {
            console.warn('Error saving workspace:', e);
          }
        }, 1000); // Save after 1 second of inactivity
      },
      initializeBlockly() {
        console.log('Skipping Blockly reinitialize to prevent freezing - using existing workspace');
        // Don't reinitialize to prevent freezing
        // The existing workspace should work fine
        return;
      },
      addMissingBlocks() {
        console.log('Adding missing sensor and actuator blocks...');
        
        setTimeout(() => {
          if (window.Blockly && window.Blockly.Blocks) {
            // Sensor blocks
            if (!window.Blockly.Blocks['dht_read']) {
              window.Blockly.Blocks['dht_read'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("DHT22 pino")
                      .appendField(new Blockly.FieldNumber(4), "PIN");
                  this.setOutput(true, "Number");
                  this.setColour('#FF6B6B');
                  this.setTooltip("Sensor DHT22");
                }
              };
            }
            
            if (!window.Blockly.Blocks['ultrasonic_read']) {
              window.Blockly.Blocks['ultrasonic_read'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("Ultrassônico")
                      .appendField(new Blockly.FieldNumber(5), "TRIG");
                  this.setOutput(true, "Number");
                  this.setColour('#FF6B6B');
                  this.setTooltip("Sensor ultrassônico");
                }
              };
            }
            
            if (!window.Blockly.Blocks['ldr_read']) {
              window.Blockly.Blocks['ldr_read'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("Sensor luz pino")
                      .appendField(new Blockly.FieldNumber(34), "PIN");
                  this.setOutput(true, "Number");
                  this.setColour('#FF6B6B');
                  this.setTooltip("Sensor de luz");
                }
              };
            }
            
            // Actuator blocks
            if (!window.Blockly.Blocks['servo_write']) {
              window.Blockly.Blocks['servo_write'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("Servo pino")
                      .appendField(new Blockly.FieldNumber(9), "PIN")
                      .appendField("ângulo")
                      .appendField(new Blockly.FieldNumber(90), "ANGLE");
                  this.setPreviousStatement(true, null);
                  this.setNextStatement(true, null);
                  this.setColour('#4ECDC4');
                  this.setTooltip("Controlar servo");
                }
              };
            }
            
            if (!window.Blockly.Blocks['led_write']) {
              window.Blockly.Blocks['led_write'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("LED pino")
                      .appendField(new Blockly.FieldNumber(2), "PIN")
                      .appendField(new Blockly.FieldDropdown([["ON","HIGH"], ["OFF","LOW"]]), "STATE");
                  this.setPreviousStatement(true, null);
                  this.setNextStatement(true, null);
                  this.setColour('#4ECDC4');
                  this.setTooltip("Controlar LED");
                }
              };
            }
            
            // Additional sensor blocks
            if (!window.Blockly.Blocks['pir_read']) {
              window.Blockly.Blocks['pir_read'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("PIR pino")
                      .appendField(new Blockly.FieldNumber(12), "PIN");
                  this.setOutput(true, "Boolean");
                  this.setColour('#FF6B6B');
                  this.setTooltip("Sensor de movimento PIR");
                }
              };
            }
            
            if (!window.Blockly.Blocks['temp_read']) {
              window.Blockly.Blocks['temp_read'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("Temperatura pino")
                      .appendField(new Blockly.FieldNumber(36), "PIN");
                  this.setOutput(true, "Number");
                  this.setColour('#FF6B6B');
                  this.setTooltip("Sensor de temperatura");
                }
              };
            }
            
            // Additional actuator blocks
            if (!window.Blockly.Blocks['buzzer_tone']) {
              window.Blockly.Blocks['buzzer_tone'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("Buzzer pino")
                      .appendField(new Blockly.FieldNumber(8), "PIN")
                      .appendField("freq")
                      .appendField(new Blockly.FieldNumber(1000), "FREQ");
                  this.setPreviousStatement(true, null);
                  this.setNextStatement(true, null);
                  this.setColour('#4ECDC4');
                  this.setTooltip("Tocar som no buzzer");
                }
              };
            }
            
            if (!window.Blockly.Blocks['motor_control']) {
              window.Blockly.Blocks['motor_control'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("Motor pino")
                      .appendField(new Blockly.FieldNumber(10), "PIN")
                      .appendField("velocidade")
                      .appendField(new Blockly.FieldNumber(255), "SPEED");
                  this.setPreviousStatement(true, null);
                  this.setNextStatement(true, null);
                  this.setColour('#4ECDC4');
                  this.setTooltip("Controlar motor");
                }
              };
            }
            
            if (!window.Blockly.Blocks['relay_control']) {
              window.Blockly.Blocks['relay_control'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("Relé pino")
                      .appendField(new Blockly.FieldNumber(7), "PIN")
                      .appendField(new Blockly.FieldDropdown([["ON","HIGH"], ["OFF","LOW"]]), "STATE");
                  this.setPreviousStatement(true, null);
                  this.setNextStatement(true, null);
                  this.setColour('#4ECDC4');
                  this.setTooltip("Controlar relé");
                }
              };
            }
            
            // Additional ESP32 blocks
            if (!window.Blockly.Blocks['gpio_digital_read']) {
              window.Blockly.Blocks['gpio_digital_read'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("Ler digital pino")
                      .appendField(new Blockly.FieldNumber(13), "PIN");
                  this.setOutput(true, "Boolean");
                  this.setColour('#A65C81');
                  this.setTooltip("Lê valor digital de um pino");
                }
              };
            }
            
            if (!window.Blockly.Blocks['gpio_analog_read']) {
              window.Blockly.Blocks['gpio_analog_read'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("Ler analógico pino")
                      .appendField(new Blockly.FieldNumber(34), "PIN");
                  this.setOutput(true, "Number");
                  this.setColour('#A65C81');
                  this.setTooltip("Lê valor analógico de um pino");
                }
              };
            }
            
            if (!window.Blockly.Blocks['wifi_begin']) {
              window.Blockly.Blocks['wifi_begin'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("WiFi conectar")
                      .appendField(new Blockly.FieldTextInput("SSID"), "SSID")
                      .appendField("senha")
                      .appendField(new Blockly.FieldTextInput("PASSWORD"), "PASSWORD");
                  this.setPreviousStatement(true, null);
                  this.setNextStatement(true, null);
                  this.setColour('#A65C81');
                  this.setTooltip("Conectar ao WiFi");
                }
              };
            }
            
            if (!window.Blockly.Blocks['wifi_status']) {
              window.Blockly.Blocks['wifi_status'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("WiFi conectado?");
                  this.setOutput(true, "Boolean");
                  this.setColour('#A65C81');
                  this.setTooltip("Verifica se WiFi está conectado");
                }
              };
            }
            
            if (!window.Blockly.Blocks['serial_begin']) {
              window.Blockly.Blocks['serial_begin'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("Serial iniciar")
                      .appendField(new Blockly.FieldNumber(115200), "BAUD");
                  this.setPreviousStatement(true, null);
                  this.setNextStatement(true, null);
                  this.setColour('#A65C81');
                  this.setTooltip("Inicializar comunicação serial");
                }
              };
            }
            
            if (!window.Blockly.Blocks['serial_print']) {
              window.Blockly.Blocks['serial_print'] = {
                init: function() {
                  this.appendValueInput("TEXT")
                      .setCheck("String")
                      .appendField("Serial imprimir");
                  this.setPreviousStatement(true, null);
                  this.setNextStatement(true, null);
                  this.setColour('#A65C81');
                  this.setTooltip("Imprimir texto no serial");
                }
              };
            }
            
            if (!window.Blockly.Blocks['delay']) {
              window.Blockly.Blocks['delay'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("Aguardar")
                      .appendField(new Blockly.FieldNumber(1000), "TIME")
                      .appendField("ms");
                  this.setPreviousStatement(true, null);
                  this.setNextStatement(true, null);
                  this.setColour('#A65C81');
                  this.setTooltip("Aguardar um tempo em milissegundos");
                }
              };
            }
            
            if (!window.Blockly.Blocks['pin_mode']) {
              window.Blockly.Blocks['pin_mode'] = {
                init: function() {
                  this.appendDummyInput()
                      .appendField("Configurar pino")
                      .appendField(new Blockly.FieldNumber(13), "PIN")
                      .appendField("como")
                      .appendField(new Blockly.FieldDropdown([["INPUT","INPUT"], ["OUTPUT","OUTPUT"], ["INPUT_PULLUP","INPUT_PULLUP"]]), "MODE");
                  this.setPreviousStatement(true, null);
                  this.setNextStatement(true, null);
                  this.setColour('#A65C81');
                  this.setTooltip("Configurar modo do pino");
                }
              };
            }
            
            console.log('All missing blocks added successfully');
            
            // Force toolbox refresh to show new blocks
            setTimeout(() => {
              try {
                if (this.workspace && this.workspace.getToolbox()) {
                  this.workspace.getToolbox().refreshSelection();
                  console.log('Toolbox refreshed after adding blocks');
                }
              } catch (e) {
                console.warn('Error refreshing toolbox:', e);
              }
            }, 100);
          }
        }, 500);
      },
      initializeBlocklyFromMounted() {
        // This is the initial Blockly setup from mounted lifecycle
        console.log('Setting up Blockly from mounted...');
        // The existing mounted logic will handle the initialization
      },
      generateCodeFromBlocks() {
        try {
          if (this.workspace && javascriptGenerator) {
            const rawCode = javascriptGenerator.workspaceToCode(this.workspace);
            const cppCode = this.generateArduinoCode(rawCode);
            this.$global.editor.sourceCode = cppCode;
            
            // Show success message
            console.log('✅ Código C++ gerado a partir dos blocos');
          }
        } catch(e) {
          console.error('Error generating code from blocks:', e);
        }
      },
      clearWorkspace() {
        if (confirm('Tem certeza que deseja limpar todos os blocos?')) {
          try {
            if (this.workspace) {
              this.workspace.clear();
              this.$global.editor.blockCode = '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables></xml>';
              this.$global.editor.rawCode = '';
              if (this.$global.editor.mode <= 2) {
                this.$global.editor.sourceCode = this.generateArduinoCode('');
              }
            }
          } catch(e) {
            console.error('Error clearing workspace:', e);
          }
        }
      },
      newArduinoSketch() {
        const template = `// Novo sketch Arduino
#include <Arduino.h>

void setup() {
  Serial.begin(115200);
  // Configuração inicial aqui
}

void loop() {
  // Código principal aqui
  delay(1000);
}`;
        this.$global.editor.sourceCode = template;
        localStorage.setItem('kb_manual_code', template);
      },
      formatCode() {
        try {
          if (this.$global.editor.sourceCode) {
            let formatted = this.$global.editor.sourceCode
              .replace(/{\s*\n\s*/g, ' {\n  ') // Opening braces
              .replace(/;\s*\n\s*/g, ';\n  ') // Semicolons
              .replace(/}\s*\n/g, '}\n\n') // Closing braces
              .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple empty lines
              .trim();
            
            this.$global.editor.sourceCode = formatted;
            console.log('✅ Código formatado');
          }
        } catch(e) {
          console.warn('Error formatting code:', e);
        }
      },
      validateCode() {
        try {
          const code = this.$global.editor.sourceCode || '';
          const errors = [];
          
          // Basic C++ syntax validation
          const lines = code.split('\n');
          lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#')) {
              // Check for missing semicolons
              if (!trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
                errors.push(`Linha ${index + 1}: Possível ponto e vírgula ausente`);
              }
            }
          });
          
          // Check for basic structure
          if (!code.includes('void setup()')) {
            errors.push('Função setup() não encontrada');
          }
          if (!code.includes('void loop()')) {
            errors.push('Função loop() não encontrada');
          }
          
          if (errors.length === 0) {
            console.log('✅ Código válido!');
          } else {
            console.warn('⚠️ Problemas encontrados:', errors);
          }
        } catch(e) {
          console.warn('Error validating code:', e);
        }
      },
      copyCode() {
        try {
          if (navigator.clipboard && this.$global.editor.sourceCode) {
            navigator.clipboard.writeText(this.$global.editor.sourceCode);
            console.log('✅ Código copiado para área de transferência');
          }
        } catch(e) {
          console.warn('Error copying code:', e);
        }
      },
      compileCode() {
        try {
          console.log('🔨 Iniciando compilação...');
          console.log('Código:', this.$global.editor.sourceCode);
          // Here you would integrate with a compiler service
          console.log('✅ Compilação simulada concluída');
        } catch(e) {
          console.error('Error compiling code:', e);
        }
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
    /* Modern Editor Styles */
    .modern-editor-page {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--kb-surface);
    }
    
    .modern-editor-content {
        flex: 1;
        overflow: hidden;
    }
    
    .modern-editor-multipane {
        height: 100%;
        display: flex;
    }
    
    .modern-blockly-panel {
        background: var(--kb-surface-2);
        border-right: 1px solid var(--kb-border);
        overflow: hidden;
        flex-shrink: 0;
    }
    
    .modern-editor-main {
        flex: 1;
        display: flex;
        overflow: hidden;
    }
    
    .modern-blockly-workspace {
        flex: 1;
        position: relative;
        background: var(--kb-surface);
        height: 100%;
        width: 100%;
    }
    
    .modern-code-editor {
        background: var(--kb-surface-2);
        border-left: 1px solid var(--kb-border);
        overflow: hidden;
    }

    .modern-code-editor-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--kb-surface);
    }

    /* Editor Mode Layouts */
    .editor-mode-single {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .editor-mode-split {
        width: 100%;
        height: 100%;
        display: flex;
    }

    .blockly-panel {
        display: flex;
        flex-direction: column;
        background: var(--kb-surface);
        border-right: 1px solid var(--kb-border);
        flex-shrink: 0;
    }

    .code-panel {
        display: flex;
        flex-direction: column;
        background: var(--kb-surface);
        min-width: 300px;
    }

    .panel-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--kb-surface-3);
        border-bottom: 1px solid var(--kb-border);
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--kb-text-primary);
        flex-shrink: 0;
    }

    .panel-header i {
        color: var(--kb-primary);
    }

    .panel-header__actions {
        display: flex;
        gap: 4px;
        margin-left: auto;
    }

    .panel-action {
        padding: 4px 6px;
        background: none;
        border: none;
        color: var(--kb-text-muted);
        cursor: pointer;
        border-radius: var(--kb-radius-sm);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
    }

    .panel-action:hover {
        background: var(--kb-surface-hover);
        color: var(--kb-text-primary);
    }

    .panel-action--active {
        background: var(--kb-primary);
        color: white;
    }

    .modern-panel-resizer {
        background: var(--kb-border) !important;
        transition: background-color 0.2s ease !important;
        width: 4px !important;
    }

    .modern-panel-resizer:hover {
        background: var(--kb-primary) !important;
    }




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

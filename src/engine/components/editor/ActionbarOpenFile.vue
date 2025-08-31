<template>
    <div>
        <v-tooltip bottom>
            <v-btn color="primary darken-2" slot="activator" icon @click="openFilePopUp" class="!text-gray-200 hover:!text-white">
                <v-icon dark>fa-folder-open</v-icon>
            </v-btn>
            <span>Abrir arquivo</span>
        </v-tooltip>
    </div>
</template>

<script>
  // web-only: remover dependência de 'url'
  import util from "@/engine/utils";

  const isElectron = typeof process !== 'undefined' && process.versions && !!process.versions.electron;
  let electron = null;
  let ipcRenderer = null;
  try {
    if (isElectron) {
      electron = require("electron");
      ipcRenderer = electron.ipcRenderer;
    }
  } catch (e) { electron = null; ipcRenderer = null; }
  let fs = null; try { if (isElectron) { fs = require("fs"); } } catch(e) { fs = null; }
  let path = null; try { if (isElectron) { path = require("path"); } } catch(e) { path = { extname(){ return ""; } }; }
  //const WIN = new BrowserWindow({width: 800, height: 600});
  export default {
    data() {
      return {
        openDialog: false
      };
    },
    created() {
      if (ipcRenderer) { ipcRenderer.on("file-open", this.openFilePopUp); }
    },
    methods: {
      openFilePopUp: async function() {
        let mode = this.$global.editor.mode;
        if (mode < 3) {
          let userDec = await this.$dialog.confirm({
            title: "Atenção",
            text: "Abrir um novo arquivo sobrescreverá o workspace. O que deseja fazer?",
            actions: [
              { text: "Confirmar", key: "confirm" },
              { text: "Cancelar", key: "cancel", color: "red darken-1" }
            ]
          });
          if (userDec === "confirm") {
            if (!ipcRenderer) {
              // Web fallback: open .bly from local
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.bly,.txt,text/plain';
              input.onchange = (e)=>{
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ()=>{
                  try {
                    const raw = reader.result || '';
                    const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw);
                    const decoded = util.b64DecodeUnicode(text);
                    this.$global.editor.blockCode = decoded;
                    this.$global.$emit("editor-mode-change", this.$global.editor.mode);
                  } catch (err) {
                    this.$dialog.notify.error('Falha ao abrir arquivo');
                  }
                };
                reader.readAsText(file);
              };
              input.click();
              return;
            }
            let filePaths = await ipcRenderer.invoke("show-open-dialog", { title: "Abrir arquivo Blockly" });
            if (filePaths) {
              let file = filePaths[0];
              let text = fs.readFileSync(file, "utf8");
              text = util.b64DecodeUnicode(text);
              this.$global.editor.blockCode = text;
              this.$global.$emit("editor-mode-change", this.$global.editor.mode);
              //--track--//
              this.$track.event("editor", "open", { evLabel: path.extname(file), evValue: 1, clientID: this.$track.clientID }).catch(err => { console.log(err);});
            }
          }
        } else {
          let userDec = await this.$dialog.confirm({
            title: "Salvar seu código primeiro?",
            text: "Abrir um novo arquivo sobrescreverá seu código. O que deseja fazer?",
            actions: [
              { text: "Cancelar", key: false },
              { text: "Limpar e Abrir", key: true }
            ]
          });
          if (userDec === true) {
            if (!ipcRenderer) {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.kbp,.ino,.c,.cpp,.txt,text/plain';
              input.onchange = (e)=>{
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ()=>{
                  const raw = reader.result || '';
                  const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw);
                  this.$global.editor.sourceCode = text;
                };
                reader.readAsText(file);
              };
              input.click();
              return;
            }
            let filePaths = await ipcRenderer.invoke("show-open-dialog", { title: "Abrir arquivo de código" });
            if (filePaths) {
              let file = filePaths[0];
              this.$global.editor.sourceCode = fs.readFileSync(file, "utf8");
              this.$track.event("editor", "open", { evLabel: path.extname(file), evValue: 1 }).catch(err => { console.log(err);});
            }
          }
        }
      }
    }
  };
</script>

<template>
    <v-tooltip bottom>
        <v-btn color="primary darken-2" slot="activator" icon @click="saveFilePopUp" class="!text-gray-200 hover:!text-white">
            <v-icon dark>fa-floppy-o</v-icon>
        </v-btn>
        <span>Salvar arquivo</span>
    </v-tooltip>
</template>

<script>
  const isElectron = typeof process !== 'undefined' && process.versions && !!process.versions.electron;
  let ipcRenderer = null;
  try {
    if (isElectron) {
      ipcRenderer = require("electron").ipcRenderer;
    }
  } catch (e) { ipcRenderer = null; }
  let fs = null; try { if (isElectron) { fs = require("fs"); } } catch(e) { fs = null; }
  import util from "@/engine/utils";
  let path = null; try { if (isElectron) { path = require("path"); } } catch(e) { path = { extname(){ return ""; } }; }
  export default {
    data() {
      return {
        saveDialog: false,
      };
    },
    created() {
      if (ipcRenderer) {
        ipcRenderer.on("file-save", this.saveFilePopUp);
      }
    },
    methods: {
      saveFilePopUp: async function() {
        let mode = this.$global.editor.mode;
        if (mode < 3) {
          const blyOption = { title: 'Salvar arquivo de Blocos' };
          if (!ipcRenderer) {
            try {
              const Blockly = this.$global.editor.Blockly;
              const bCode = Blockly ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)) : '';
              const encoded = util.b64EncodeUnicode(bCode || '');
              const blob = new Blob([encoded], { type: 'text/plain;charset=utf-8' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'projeto.bly';
              a.click();
              URL.revokeObjectURL(a.href);
              this.$global.ui.snackbar && this.$global.ui.snackbar('Arquivo salvo com sucesso');
            } catch (e) { this.$dialog && this.$dialog.notify && this.$dialog.notify.error('Falha ao salvar'); }
            return;
          }
          let res = await ipcRenderer.invoke('show-save-dialog', blyOption);
          if (res) {
            let Blockly = this.$global.editor.Blockly;
            let bCode = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace));
            fs.writeFileSync(res, util.b64EncodeUnicode(bCode), 'utf8');
            this.$global.ui.snackbar('Arquivo salvo com sucesso');
          }
        } else {
          const codeOption = { title: 'Salvar arquivo de Código' };
          if (!ipcRenderer) {
            try {
              const source = this.$global.editor.sourceCode || '';
              const blob = new Blob([source], { type: 'text/plain;charset=utf-8' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'projeto.cpp';
              a.click();
              URL.revokeObjectURL(a.href);
              this.$global.ui.snackbar && this.$global.ui.snackbar('Arquivo salvo com sucesso');
            } catch (e) { this.$dialog && this.$dialog.notify && this.$dialog.notify.error('Falha ao salvar'); }
            return;
          }
          let res = await ipcRenderer.invoke('show-save-dialog', codeOption);
          if (res) {
            let source = this.$global.editor.sourceCode;
            fs.writeFileSync(res, source, 'utf8');
            this.$global.ui.snackbar('Arquivo salvo com sucesso');
          }
        }
      },
    },
  };
</script>
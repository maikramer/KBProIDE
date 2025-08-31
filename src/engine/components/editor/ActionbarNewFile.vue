<template>
    <v-tooltip bottom>
        <v-btn color="primary darken-2" slot="activator" icon @click="newFile" class="!text-gray-200 hover:!text-white">
            <v-icon dark>fa-file-text-o</v-icon>
        </v-btn>
        <span>Novo arquivo</span>
    </v-tooltip>
</template>
<script>
  // === uitls ===
  import util from "@/engine/utils";

  const isElectron = typeof process !== 'undefined' && process.versions && !!process.versions.electron;
  let electron = null; try { if (isElectron) { electron = require("electron"); } } catch(e) { electron = null; }
  const reformatCode = (util.requireFunc && isElectron) ? util.requireFunc(util.packageDir + "/kbide-package-clang-format/main") : ((code)=> code);

  export default {
    data() {
      return {};
    },
    created() {
      if (electron && electron.ipcRenderer) {
        electron.ipcRenderer.on("file-new", this.newFile);
      }
    },
    methods: {
      clangFormat() {
        this.$global.editor.sourceCode = reformatCode(this.$global.editor.sourceCode);
      },
      newFile: async function() {
        if (this.$global.editor.mode < 3 || this.$store.state.rawCode.mode === true) {
          const res = await this.$dialog.confirm({
            text: "Você realmente deseja limpar este workspace?",
            title: "Atenção",
            actions: [
              { text: "Confirmar", key: "confirm" },
              { text: "Cancelar", key: false, color: "red darken-1" }
            ]
          });

          if (res) {
            if (res === "confirm") {
              this.$global.editor.blockCode = "";
              this.$global.$emit("editor-mode-change", this.$global.editor.mode);

              if (this.$store.state.rawCode.mode === true) {
                this.$global.editor.mode = 2;
                this.$global.$emit("editor-mode-change", 2);
                this.$global.editor.mode = 3;
                this.$global.$emit("editor-mode-change", 3, true);
              }
            }
          }
        } else {
          const res = await this.$dialog.confirm({
            text: "Você realmente deseja limpar este workspace?",
            title: "Atenção",
            actions: [
              { text: "Limpar", key: true },
              { text: "Converter do Bloco", key: "convert" },
              { text: "Cancelar", key: false, color: "red darken-1" }
            ]
          });
          if (res && res !== "Cancel") {
            if (res === "convert") {
              this.$global.$emit("editor-mode-change", this.$global.editor.mode, true);
              this.clangFormat();
            } else {
              this.$global.$emit("editor-mode-change", this.$global.editor.mode, false, true);
              this.clangFormat();
            }
          }
        }
      }
    }
  };
</script>

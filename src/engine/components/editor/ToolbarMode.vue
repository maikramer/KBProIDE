<template>
    <div>
        <v-tooltip bottom>
            <v-btn color="primary darken-2" slot="activator" icon @click="onChangeModeDialog">
                <v-icon dark>fa-users</v-icon>
            </v-btn>
            <span>Modo de Programação</span>
        </v-tooltip>
        <div v-if="modeDialog" class="kb-modal-overlay" @click.self="modeDialog = false">
            <div class="kb-modal rounded-xl bg-[var(--kb-surface-2)] text-gray-200 ring-1 ring-white/10">
                <div class="text-lg font-semibold px-6 py-4">
                    <span class="headline">Selecione o modo de programação</span>
                </div>
                <v-divider></v-divider>
                <div class="p-0">
                    <v-item-group>
                        <v-container grid-list-md class="px-4 pb-6">
                            <v-layout wrap>
                                <template v-for="(mode,index) in modes">
                                    <template v-if="$global.setting.devMode === false && (index+1) === 2">
                                    </template>
                                    <template v-else>
                                        <v-flex xs12 :class="`md${$global.setting.devMode? '4' : '6'}`" :key="index">
                                            <v-hover>
                                                <v-card light slot-scope="{ hover }"
                                                        :class="`elevation-${hover ? 12 : (selectingMode == index+1? 8 : 2)}`"
                                                        class="rounded-xl bg-[var(--kb-surface)] hover:ring-2 ring-white/20 transition"
                                                        @click="selectingMode = mode.mode"
                                                        height="200">
                                                    <transition name="fade">
                                                        <div class="sneaker" v-if="selectingMode == index+1"
                                                             transition="fade-transition">
                                                            <v-layout row justify-space-between
                                                                      class="ma-0 bg-success lighten-2">
                                                                <v-flex xs2>
                                                                </v-flex>
                                                                <v-flex xs2 class="text-sm-right">
                                                                    <i class="fa fa-check-circle fa-lg text-white"></i>
                                                                </v-flex>
                                                            </v-layout>
                                                        </div>
                                                    </transition>
                                                    <v-card-text class="pt-2">
                                                        <div class="layout ma-0 align-center column pt-2">
                                                            <v-avatar color="primary" :size="mode.icon.size" class="shadow ring-2 ring-white/20">
                                                                <img :src="mode.icon.src" alt="Kid Level">
                                                            </v-avatar>
                                                            <div class="flex text-sm-center mt-2">
                                                                <div class="subheading font-medium">{{mode.name}}</div>
                                                                <span class="caption opacity-70">{{mode.desc}}</span>
                                                            </div>
                                                        </div>
                                                    </v-card-text>
                                                </v-card>
                                            </v-hover>
                                        </v-flex>
                                    </template>
                                </template>
                            </v-layout>
                        </v-container>
                    </v-item-group>
                </div>
                <div class="px-4 pb-4 flex items-center">
                    <div class="flex-1"></div>
                    <v-btn :disabled="this.selectingMode === this.$global.editor.mode"
                           :class="{
                              'btn-success': this.selectingMode !== this.$global.editor.mode,
                              'disabled': this.selectingMode === this.$global.editor.mode
                            }"
                           flat class="rounded-lg"
                           @click="changeEditorMode(selectingMode)">
                        Trocar Editor
                    </v-btn>
                    <v-btn class="btn-danger rounded-lg"
                           flat
                           @click="modeDialog = false">
                        Fechar
                    </v-btn>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  // === UI Management ===
  export default {
    created: function() {
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          if (this.modeDialog === true) {
            console.log("---------> Do something when detect escape / ToolbarMode");
            this.modeDialog = false;
          }
        }
      });
    },
    data() {
      return {
        selectingMode: this.$global.editor.mode,
        modes: [
          {
            name: "Programação em blocos",
            desc: "Programação fácil com blocos",
            icon: {
              src: "/static/icons/jigsaw_128_wbg.png",
              size: "96"
            },
            mode: 1
          },
          {
            name: "Modo duplo (Blocos & C/C++)",
            desc: "Aprenda a converter blocos em código",
            icon: {
              src: "/static/icons/dual2_128_wbg.png",
              size: "96"
            },
            mode: 2
          },
          {
            name: "Programação em texto",
            desc: "Codificação em C/C++",
            icon: {
              src: "/static/icons/source-code2_128_wbg.png",
              size: "96"
            },
            mode: 3
          }
        ],
        modeDialog: false
      };
    },
    computed: {},
    methods: {
      onChangeModeDialog() {

        if (this.$global.editor.rollbackMode !== 0) {
          this.$store.dispatch("rawCodeMode", false);
          this.$global.editor.rawCodeMode = false;
          this.$global.editor.mode = this.$global.editor.rollbackMode;
          this.$global.$emit("editor-mode-change", this.$global.editor.rollbackMode);
          this.$global.editor.rollbackMode = 0;
        }

        this.modeDialog = !this.modeDialog;
      }
      ,
      changeEditorMode: async function(mode) {
        console.log("editor change mode to : " + mode);
        this.modeDialog = false;
        if (mode >= 3) {

          /* Monaco config */
          this.$global.editor.editor_options.readOnly = false;

          let res = true; //force just switch
          if (res === "convert") { //convert from block
            this.$global.editor.mode = mode;
            this.$nextTick(function() { //wait for element changed before fire event
              this.$global.$emit("editor-mode-change", mode, true);
            });
          } else if (res === true) { //just switch
            this.$global.editor.mode = mode;
            this.$nextTick(function() { //wait for element changed before fire event
              this.$global.$emit("editor-mode-change", mode);
            });
          }
        } else {

          /* Monaco config */
          this.$global.editor.editor_options.readOnly = true;

          this.$global.editor.mode = mode;
          this.$nextTick(function() { //wait for element changed before fire event
            this.$global.$emit("editor-mode-change", mode);
          });
        }
        //--tracking--//
        this.$track.event("editor", "mode_change", { evLabel: "mode_" + mode, evValue: 1, clientID: this.$track.clientID }).catch(err => { console.log(err);});
      }
    },
    watch: {
      "modeDialog": function(val) {
        if (val) {//on opening
          this.selectingMode = this.$global.editor.mode;
        }
      }
    }
  };
</script>

<style lang="stylus" scoped>
    @import "../../../theme/component-design.styl"

    /*https://github.com/vuetifyjs/vuetify/issues/2111*/

    .dialog {
        z-index: inherit
    }

    .caption, .subheading {
        font-weight: 400;
    }

    .sneaker {
        width: 100%;
        height: 20px;
        display: block;
        position: absolute;
        z-index: 999;
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .3s;
    }

    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0;
    }
    .kb-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        -webkit-tap-highlight-color: transparent;
    }
    .kb-modal {
        width: 800px;
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 32px);
        overflow: auto;
    }
</style>

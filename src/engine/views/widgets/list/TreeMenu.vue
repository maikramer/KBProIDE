<template>
    <v-list class="rounded-xl bg-[var(--kb-surface-2)] text-gray-200 ring-1 ring-white/10">
        <v-list-group
                v-for="(item,index) in nodes"
                :key="index"
        >
            <template v-slot:activator>
                <v-list-tile avatar @click="" class="hover:bg-white/5 rounded-lg">
                    <v-list-tile-content>
                        <v-list-tile-title style="height: 34px;">

                          <div style="display: flex; align-items:center">
                            <img src="/static/icons/SVG/201556.svg" alt="" style="width: 28px; height: 28px;"/>
                            <span class="pl-3 font-medium">{{ item.title }}</span>
                          </div>

                        </v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </template>
            <template v-if="
                item.examples &&
                item.examples.length > 0 &&
                item.examples[0] &&
                item.examples[0].examples !== undefined &&
                item.examples[0].examples.find(obj => typeof(obj) === 'string' && (obj.endsWith('.md') || obj.endsWith('.ino') || obj.endsWith('.bly')))">
            <v-expansion-panel popout>
                <v-expansion-panel-content v-for="(example,index) in item.examples" :key="index">
                    <template v-slot:header>
                        <div>
                            <v-layout row wrap align-center>
                                <v-flex xs12 sm3>
                                    <v-icon>fa-play</v-icon>&nbsp;&nbsp;{{example.title}}
                                </v-flex>
                                <v-flex xs12 sm6>
                                    <v-btn
                                            v-if="example.examples && example.examples.find(obj=>obj.endsWith('.bly'))"
                                            small
                                            color="primary"
                                            @click.stop=""
                                            @click="openBlock(example.dir + '/' + example.examples.find(obj=>obj.endsWith('.bly')))">
                                        <v-icon>fa-puzzle-piece</v-icon>
                                        &nbsp;&nbsp;Open Block
                                    </v-btn>
                                    <v-btn
                                            v-if="example.examples.find(obj=>obj.endsWith('.ino'))"
                                            small
                                            color="primary"
                                            @click.stop=""
                                            @click="openCode(example.dir + '/' + example.examples.find(obj=>obj.endsWith('.ino')))">
                                        <v-icon>fa-code</v-icon>&nbsp;&nbsp;Open Code
                                    </v-btn>
                                </v-flex>
                            </v-layout>
                        </div>
                    </template>
                    <v-card class="rounded-lg bg-[var(--kb-surface)] ring-1 ring-white/10">
                        <v-card-text v-if="example.examples.find(obj=>obj.endsWith('.md'))">
                            <div class="vue-markdown">
                                <MarkdownRender :content="getMarkdown(example)" />
                            </div>
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
            </template>
            <tree-menu v-else :nodes="item.examples" v-on:open="open"></tree-menu>
        </v-list-group>
    </v-list>
</template>
<script>
  let fs = null; try { const isElectron = typeof process !== 'undefined' && process.versions && !!process.versions.electron; if (isElectron) { fs = require("fs"); } } catch(e) { fs = null; }
  let mother = null;
  import MarkdownRender from "@/engine/components/common/MarkdownRender.vue";
  export default {
    props: ["label", "nodes"],
    components : {
      MarkdownRender,
    },
    name: "tree-menu",
    created(){
      mother = this;
    },
    data(){
      return { mdCache: {} };
    },
    methods : {
      getMarkdown(files) {
        let mdFile = files.examples.find(obj => obj.endsWith(".md"));
        if (!mdFile) return '';
        const key = (files.dir || '') + '/' + mdFile;
        if (this.mdCache[key]) return this.mdCache[key];
        if (fs && fs.readFileSync) {
          try { this.mdCache[key] = fs.readFileSync(files.dir + "/" + mdFile, "utf8"); return this.mdCache[key]; } catch(e) { return ''; }
        }
        try {
          fetch(key, { cache: 'no-store' }).then(async r=>{
            if (!r.ok) return;
            const text = await r.text();
            // Vue 3: no this.$set; assign to reactive object directly
            this.mdCache[key] = text;
          }).catch(()=>{});
        } catch(e) {}
        return this.mdCache[key] || '';
      },
      editTag() {
        if (document.readyState !== "complete") {
          document.addEventListener("DOMContentLoaded", function() {
            mother.prepareTags();
          }, false);
        } else {
          mother.prepareTags();
        }
      },
      prepareTags() {
        let markdowns = document.getElementsByClassName("vue-markdown");
        for (let inx = 0; inx < markdowns.length; inx++) {
          let markdownSection = markdowns.item(inx);
          let aTags = markdownSection.getElementsByTagName("a");
          if (aTags && aTags.length > 0) {
            for (let i = 0; i < aTags.length; i++) {
              let originalHref = aTags.item(i).href.slice(0);
              if (originalHref.indexOf("#") < 0) {
                aTags[i].setAttribute("onclick", "(function(u){ try{ const isE= typeof process!=='undefined' && process.versions && !!process.versions.electron; if(isE){ require('electron').shell.openExternal(u);} else { window.open(u,'_blank'); } }catch(e){ window.open(u,'_blank'); } })('" + originalHref + "')");
                aTags[i].href = "#";
              }
            }
          }
        }
        return false;
      },
      openBlock(file, exampleInfo) {
        this.$emit('open','block',file,exampleInfo);
      },
      openCode(file, exampleInfo) {
        this.$emit('open','code',file,exampleInfo);
      },
      open(type,file,info){
        this.$emit('open',type,file,info);
      }
    }
  };
</script>

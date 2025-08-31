<template>
  <div class="markdown-body" v-html="html"></div>
</template>

<script>
  import { marked } from 'marked'
  export default {
    name: 'MarkdownRender',
    props: { content: { type: String, default: '' } },
    computed: {
      html() {
        try { return marked.parse(this.content || '') } catch(e) { return this.content || '' }
      }
    },
    mounted(){ this.afterRender() },
    updated(){ this.afterRender() },
    methods: {
      afterRender(){
        const root = this.$el
        const links = root ? root.getElementsByTagName('a') : []
        for(let i=0;i<links.length;i++){
          const href = links[i].getAttribute('href')
          if(href && !href.startsWith('#')){
            links[i].setAttribute('onclick', "(function(u){ try{ const isE= typeof process!=='undefined' && process.versions && !!process.versions.electron; if(isE){ require('electron').shell.openExternal(u);} else { window.open(u,'_blank'); } }catch(e){ window.open(u,'_blank'); } })('"+href+"')")
            links[i].setAttribute('href', '#')
          }
        }
      }
    }
  }
</script>

<style>
/* optional basic styling can be added here */
</style>



<template>
  <v-toolbar
    color="primary"
    fixed
    dark
    app
    height="64px"
  >
    <v-toolbar-title v-if="!$route.meta.hide_drawer" class="ml-0 pl-0">
      <v-toolbar-side-icon @click.stop="handleDrawerToggle"></v-toolbar-side-icon>
    </v-toolbar-title>

    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <img v-on="on" src="/static/logo/KBIDE.png" height="45"
             alt="Problem? report me at fb.com/comdet"
             class="mr-3"
             style="border-radius: 8px; background-color: #ffffffa8;">
      </template>
      <span>KBIDE by MakerAsia</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <img v-on="on" src="/static/logo/kidcom_128.png" height="45"
             alt="KidBright Community"
             class="mr-2"
             style="border-radius: 8px; background-color: rgba(255, 255, 255, 0.8);">
      </template>
      <span>KidBright Community</span>
    </v-tooltip>

    <!-- dynamic left toolbar -->
    <template v-for="(comp,compName) in toolbars">
      <template v-for="(toolbarTarget,tbName) in comp">
        <transition name="fade">
        <async-component :target="toolbarTarget" :key="compName+'.'+tbName"/>
        </transition>
      </template>
    </template>

    <v-divider class="mx-1" inset vertical></v-divider>

    <!-- load board package toolbar -->
    <template v-for="(comp,index) in appToolbarComp">
      <template v-for="(compName,index) in comp.comp">
        <transition name="fade">
        <component v-if="comp.info.loaded === true" :is="compName" :key="comp.name+'.'+index"></component>
        </transition>
      </template>
    </template>

    <!-- load board package toolbar -->
    <template v-for="(comp,index) in toolbarComp">
      <template v-for="(compName,index) in comp.comp">
        <transition name="fade">
          <component v-if="comp.info.loaded === true" :is="compName" :key="comp.name+'.'+index"></component>
        </transition>
      </template>
    </template>


    <v-spacer></v-spacer>

    <!-- load app package actionbar -->
    <template v-for="(comp,index) in appActionbarComp">
      <template v-for="(compName,index) in comp.comp">
        <transition name="fade">
        <component v-if="comp.info.loaded === true" :is="compName" :key="comp.name+'.'+index"></component>
        </transition>
      </template>
    </template>

    <v-divider class="mx-1" inset vertical></v-divider>

    <!-- load dynamic actionbar -->
    <template v-for="(comp,compName) in actionbar">
      <template v-for="(toolbarTarget,tbName) in comp">
        <transition name="fade">
        <async-component :target="toolbarTarget" :key="compName+'.'+tbName"/>
        </transition>
      </template>
    </template>

    <v-divider class="mx-1" inset vertical></v-divider>

    <!-- load board package actionbar -->
    <template v-for="(comp,index) in actionbarComp">
      <template v-for="(compName,index) in comp.comp">
        <transition name="fade">
        <component v-if="comp.info.loaded === true" :is="compName" :key="comp.name+'.'+index"></component>
        </transition>
      </template>
    </template>

    <v-divider class="mx-1" inset vertical></v-divider>

    <v-btn icon @click="handleFullScreen()">
      <v-icon>fullscreen</v-icon>
    </v-btn>
    <notification></notification>
  </v-toolbar>
</template>
<script>
import Vue from 'vue';
import util from '@/engine/utils';
import cm from '@/engine/ComponentManager';
import bm from '@/engine/BoardManager';
import pm from '@/engine/PackageManager';
import { defineAsyncComponent } from 'vue';
let mother = null;
export default {
  name: 'app-toolbar',
  components: {
    notification : defineAsyncComponent(()=> import("@/engine/views/Notification")),
    AsyncComponent : defineAsyncComponent(()=> import("@/engine/AsyncComponent")),
  },
  data:() => ({
    toolbars : [],
    actionbar : [],
    toolbarComp : [],
    actionbarComp : [],
    appToolbarComp : [],
    appActionbarComp : [],
  }),
  mounted(){
    this.$emit('mounted',this);
  },
  created(){
    this.$emit('created',this);
  },
  methods: {
    handleDrawerToggle () {
      window.getApp.$emit('APP_DRAWER_TOGGLED');
    },
    handleFullScreen () {
      util.toggleFullScreen();
    },
    processStaticToolbar : async(t = this)=>{
      t.toolbars = cm.listToolbar;
      t.actionbar = cm.listActionbar;
    },
    processToolbar : async function(t=this){
      t.toolbarComp = [];
      t.actionbarComp = [];
      let boardActionBar = await bm.listActionbar(this.$global.board.board);
      let boardToolbar = await bm.listToolbar(this.$global.board.board);
      for(let packageName in this.$global.board.package){
        t.actionbarComp.push({info : this.$global.board.package[packageName], name : packageName, comp : boardActionBar[packageName]});
        t.toolbarComp.push({info : this.$global.board.package[packageName], name : packageName,comp : boardToolbar[packageName] });
      }
    },
    processAppToolbar : async function(t=this){
      let t1 = [],t2 = [];
      let appActionbar = await pm.listActionbar();
      let appToolbar = await pm.listToolbar();
      for(let packageName in this.$global.packages){
        t1.push({info : this.$global.packages[packageName], name : packageName, comp : appActionbar[packageName]});
        t2.push({info : this.$global.board.package[packageName], name : packageName,comp : appToolbar[packageName] });
      }
      t.appActionbarComp = t1;
      t.appToolbarComp = t2;
    }
  }
};
</script>

<template>
<div id="themeSetting">
  <v-toolbar color="primary" dark class="rounded-t-xl bg-[var(--kb-surface-2)] ring-1 ring-white/10">
    <v-toolbar-title class="text-gray-100">
      Configurações
    </v-toolbar-title>
  </v-toolbar>
  <v-container>
    <v-layout column>
      <v-flex>
        <v-subheader class="px-1 my-2 text-gray-300">
          Cor do tema
        </v-subheader>
        <div class="color-option">
          <v-layout wrap>
            <label class="color-option--label flex xs6 pa-1" v-for="(option,index) in themeColorOptions" :key="index">
              <input type="radio" name="color" v-bind:value="option.key" v-model="themeColor">
              <span class="color-option--item bg rounded-md ring-1 ring-white/10">
                <span class="overlay">
                  <span class="material-icons">check</span>
                </span>
                <span class="color-option--item--header sideNav" :class="option.value.sideNav"></span>
                <span class="color-option--item--header mainNav" :class="option.value.mainNav"></span>
                <span class="sideMenu" :class="option.value.sideManu"></span>
              </span>
            </label>
          </v-layout>
        </div>        
      </v-flex>

      <div class="rounded-xl ring-1 ring-white/10 p-2 mt-4 bg-[var(--kb-surface-2)]">
        <v-flex>
          <v-subheader class="px-1 my-2 text-gray-300">Modo Kids</v-subheader>
          <div class="my-2">
            <v-switch
              v-model="$global.setting.kidsMode"
              :label="`Habilitado: ${$global.setting.kidsMode ? 'SIM' : 'NÃO'}`"
              @change="onKidsToggle"
            ></v-switch>
          </div>
        </v-flex>
      </div>

      <!-- component setting -->
      <template v-for="(comp,compName) in componentSetting" :key="compName">
        <template v-for="(settingTarget,settingName) in comp" :key="compName+'.'+settingName">
          <async-component :target="settingTarget" />
        </template>
      </template>
      <div class="rounded-xl ring-1 ring-white/10 p-2 mt-4 bg-[var(--kb-surface-2)]">
        <v-divider></v-divider>
        <v-flex>
            <v-subheader class="px-1 my-2 text-gray-300">
                Modo Desenvolvedor
            </v-subheader>
            <div class="my-3">
                <v-switch 
                    v-model="$global.setting.devMode" 
                    :label="`Habilitado: ${$global.setting.devMode ? 'SIM' : 'NÃO'}`">
                </v-switch>
            </div>
        </v-flex>
    </div>
    </v-layout>
  </v-container>
</div>
</template>

<script>
import cm from '@/engine/ComponentManager';
import AsyncComponent from '@/engine/AsyncComponent';
export default {
  name: 'app-setting',
  components: {    
    AsyncComponent
  },
  data: () => ({    
      themeColor: false,
      colors: {
        blue: { base: '#2196F3' },
        teal: { base: '#009688' },
        red: { base: '#F44336' },
        orange: { base: '#FF9800' },
        purple: { base: '#9C27B0' },
        indigo: { base: '#3F51B5' },
        cyan: { base: '#00BCD4' },
        pink: { base: '#E91E63' },
        green: { base: '#4CAF50' },
      },
      componentSetting : cm.listSetting,
      lightThemeArray: ["red", "purple", "indigo", "pink"],
      darkThemeArray: ["blue", "lightBlue", "teal", "orange", "cyan", "green"],
  }),
  mounted : function(){
    Object.keys(this.colors).forEach((key)=>{
      if(this.colors[key].base == this.$vuetify.theme.primary){
        this.themeColor = key;
      }
    });
  },
  methods: {
    onKidsToggle(){
      try { this.$global.$emit('kids-mode-change', !!this.$global.setting.kidsMode); } catch(e){}
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
    }
  },
  computed: {
    themeColorOptions () {
      return [
        {
          key: 'blue',
          value: {
            sideNav: 'blue',
            mainNav: 'blue',
            sideManu: 'white'
          }
        },
        {
           key: 'lightBlue',
           value: {
             sideNav: 'blue',
             mainNav: 'white',
            sideManu: 'blue lighten-1'
          }
        },
        {
          key: 'teal',
          value: {
            sideNav: 'teal',
            mainNav: 'teal',
            sideManu: 'white'
          }
        },
        {
          key: 'red',
          value: {
            sideNav: 'red',
            mainNav: 'red',
            sideManu: 'white'
          }
        },
        {
          key: 'orange',
          value: {
            sideNav: 'orange',
            mainNav: 'orange',
            sideManu: 'white'
          }
        },
        {
          key: 'purple',
          value: {
            sideNav: 'purple',
            mainNav: 'purple',
            sideManu: 'white'
          }
        },
        {
          key: 'indigo',
          value: {
            sideNav: 'indigo',
            mainNav: 'indigo',
            sideManu: 'white'
          }
        },
        {
          key: 'cyan',
          value: {
            sideNav: 'cyan',
            mainNav: 'cyan',
            sideManu: 'white'
          }
        },
        {
          key: 'pink',
          value: {
            sideNav: 'pink',
            mainNav: 'pink',
            sideManu: 'white'
          }
        },
        {
          key: 'green',
          value: {
            sideNav: 'green',
            mainNav: 'green',
            sideManu: 'white'
          }
        }
      ];
    }
  },  
  watch: {
    themeColor: {
      handler (val) {
        
        this.lightThemeArray.find(theme => theme === val) && this.cssTextLight()
        this.darkThemeArray.find(theme => theme === val) && this.cssTextDark()

        if(val){
          this.$vuetify.theme.primary = this.colors[val].base; 
          this.$global.$emit('theme-change', this.colors[val].base);
          this.$global.setting.color = this.colors[val].base;
        }
      },
      immediate: true
    }
  },
};
</script>
<style lang="stylus" scoped>
.color-option
  &--label
    position: relative
    display: block
    cursor: pointer  
    & input[type="radio"] 
      display:none
      &+span 
        position: relative
        &>.overlay
          display: none;
          position: absolute
          top: 0;
          bottom: 0;
          right: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,.3);
          text-align: center;
          line-height: 30px;
          color: #fff;                
      &:checked+span>.overlay
        display:block  
    & .bg        
      background-color: #1f2937
  &--item
    overflow: hidden;
    display: block;
    box-shadow: 0 0 2px rgba(0,0,0,.1);
    margin-bottom: 15px;      
    &--header
      height: 10px
    &>span 
      display: block;
      float: left;
      width: 50%;
      height: 20px;          
</style>

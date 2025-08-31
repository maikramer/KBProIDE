<template>
    <div id="appRoot">
        <template v-if="!$route.meta.public">
            <div class="modern-layout">
                <!-- Modern Toolbar -->
                <ModernToolbar />
                
                <!-- Main Content Area -->
                <div class="modern-layout__content">
                    <multipane 
                        v-if="$global.ui.bottomTab.length > 0"
                        class="main-vertical-layout"
                        layout="horizontal"
                        @paneResizeStop="onMainPaneResize"
                    >
                        <!-- Upper area (main content + right sidebar) -->
                        <div class="upper-area" :style="{ height: mainAreaHeight + 'px', minHeight: '400px' }">
                            <multipane 
                                v-if="$global.ui.rightTab.length > 0"
                                class="main-horizontal-layout"
                                layout="vertical"
                                @paneResizeStop="onHorizontalPaneResize"
                            >
                                <!-- Primary Content -->
                                <div class="primary-content" :style="{ width: primaryContentWidth + 'px', minWidth: '300px' }">
                                    <router-view></router-view>
                                </div>
                                
                                <!-- Horizontal Resizer -->
                                <multipane-resizer class="modern-panel-resizer"></multipane-resizer>
                                
                                <!-- Right Sidebar -->
                                <div class="right-sidebar" style="flex: 1; min-width: 250px;">
                                    <div class="panel-header">
                                        <i class="fa fa-window-restore"></i>
                                        <span>Painel Lateral</span>
                                    </div>
                                    <ModernTabs
                                        :tabs="rightTabs"
                                        v-model="rightTabIndex"
                                        @tab-close="closeRightTab"
                                    />
                                </div>
                            </multipane>
                            
                            <!-- Full width when no right tabs -->
                            <router-view v-else></router-view>
                        </div>
                        
                        <!-- Vertical Resizer -->
                        <multipane-resizer class="modern-panel-resizer modern-panel-resizer--horizontal"></multipane-resizer>
                        
                        <!-- Bottom Panel -->
                        <div class="bottom-panel" :style="{ height: bottomPanelHeight + 'px', minHeight: '150px', maxHeight: '400px' }">
                            <div class="panel-header">
                                <i class="fa fa-window-maximize"></i>
                                <span>Painel Inferior</span>
                                <div class="panel-header__actions">
                                    <button 
                                        class="panel-action" 
                                        @click="minimizeBottomPanel"
                                        title="Minimizar"
                                    >
                                        <i class="fa fa-window-minimize"></i>
                                    </button>
                                    <button 
                                        class="panel-action" 
                                        @click="closeBottomPanel"
                                        title="Fechar"
                                    >
                                        <i class="fa fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <ModernTabs
                                :tabs="bottomTabs"
                                v-model="bottomTabIndex"
                                @tab-close="closeBottomTab"
                            />
                        </div>
                    </multipane>
                    
                    <!-- No bottom panel layout -->
                    <div v-else class="full-height-layout">
                        <multipane 
                            v-if="$global.ui.rightTab.length > 0"
                            class="main-horizontal-layout"
                            layout="vertical"
                            @paneResizeStop="onHorizontalPaneResize"
                        >
                            <!-- Primary Content -->
                            <div class="primary-content" :style="{ width: primaryContentWidth + 'px', minWidth: '300px' }">
                                <router-view></router-view>
                            </div>
                            
                            <!-- Horizontal Resizer -->
                            <multipane-resizer class="modern-panel-resizer"></multipane-resizer>
                            
                            <!-- Right Sidebar -->
                            <div class="right-sidebar" style="flex: 1; min-width: 250px;">
                                <div class="panel-header">
                                    <i class="fa fa-window-restore"></i>
                                    <span>Painel Lateral</span>
                                </div>
                                <ModernTabs
                                    :tabs="rightTabs"
                                    v-model="rightTabIndex"
                                    @tab-close="closeRightTab"
                                />
                            </div>
                        </multipane>
                        
                        <!-- Full width when no right tabs -->
                        <router-view v-else></router-view>
                    </div>
                </div>

                <!-- Modern Drawers -->
                <div 
                    v-if="$global.ui.leftDrawerComponent" 
                    class="modern-drawer modern-drawer--left"
                    @click.self="$global.ui.leftDrawerComponent = null"
                >
                    <div class="modern-drawer__content">
                        <ModernPanel 
                            title="Menu" 
                            :closable="true"
                            @close="$global.ui.leftDrawerComponent = null"
                        >
                            <async-component :target="$global.ui.leftDrawerComponent"/>
                        </ModernPanel>
                    </div>
                </div>
                
                <div 
                    v-if="$global.ui.rightDrawerComponent" 
                    class="modern-drawer modern-drawer--right"
                    @click.self="$global.ui.rightDrawerComponent = null"
                >
                    <div class="modern-drawer__content">
                        <ModernPanel 
                            title="Configurações" 
                            :closable="true"
                            @close="$global.ui.rightDrawerComponent = null"
                        >
                            <async-component :target="$global.ui.rightDrawerComponent"/>
                        </ModernPanel>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <transition name="fade">
                <keep-alive>
                    <router-view :key="$route.fullpath"></router-view>
                </keep-alive>
            </transition>
        </template>
        <v-snackbar
                :bottom="$global.ui.snackbarConfig.y === 'bottom' ? true : null"
                :color="$global.ui.snackbarConfig.color"
                :left="$global.ui.snackbarConfig.x === 'left' ? true : null"
                :multi-line="$global.ui.snackbarConfig.mode === 'multi-line' ? true : null"
                :right="$global.ui.snackbarConfig.x === 'right' ? true : null"
                :timeout="$global.ui.snackbarConfig.timeout"
                :top="$global.ui.snackbarConfig.y === 'top' ? true : null"
                :vertical="$global.ui.snackbarConfig.mode === 'vertical' ? true : null"
                v-model="$global.ui.snackbarStatus"
        >
            {{ $global.ui.snackbarConfig.text }}
            <v-btn @click="$global.ui.snackbarStatus = false" dark flat icon>
                <v-icon>close</v-icon>
            </v-btn>
        </v-snackbar>
        <app-updater></app-updater>
        <v-dialog persistent v-model="firstUseDialog" max-width="450">
            <v-card class="rounded-xl bg-[var(--kb-surface)] ring-1 ring-white/10">
                <v-card-title class="text-gray-100 font-semibold">
                    <span class="headline">Bem-vindo(a) ao KBIDE</span>
                </v-card-title>
                <v-card-text class="text-gray-300">
                    <p class="title">
                        Uma IDE para todos.
                    </p>
                    <p class="subtitle">
                        Parece que você abriu a IDE pela primeira vez.
                        Há recursos importantes que você precisa conhecer aqui.
                        Vamos apresentar as novidades do KBIDE.<br/><br/>
                    </p>
                    <p style="color:red">*Nota: Cliques ficam desabilitados até o fim do tour.</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <button @click="skipTour" class="modern-btn modern-btn--outline" title="Você pode iniciar de novo em Ajuda > Tour da IDE">
                        Pular
                    </button>
                    <v-btn color="blue darken-1" flat @click="startTour('pt')" class="rounded-md !text-gray-200 hover:!text-white">Iniciar tour (PT)</v-btn>
                    <v-btn color="blue darken-1" flat @click="startTour('en')" class="rounded-md !text-gray-200 hover:!text-white">Iniciar tour (EN)</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog persistent v-model="endDialog" max-width="400">
            <v-card class="rounded-xl bg-[var(--kb-surface)] ring-1 ring-white/10">
                <v-card-title class="text-gray-100 font-semibold">
                    <span class="headline">{{endDialogTitle}}</span>
                </v-card-title>
                <v-card-text v-html="endDialogText" class="text-gray-300">
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <button @click="endDialog = false" class="modern-btn modern-btn--primary" title="Você pode iniciar de novo em Ajuda > Tour da IDE">
                        OK
                    </button>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-tour name="ideTour" :steps="tourStep" :callbacks="tourCallbacks" :options="tourOptions"></v-tour>
    </div>
</template>
<script>
  
  //========= load manager ==========//
  import bm from "@/engine/BoardManager";
  import pm from "@/engine/PackageManager";
  //import AsyncComponent from "@/engine/AsyncComponent";
  import AppEvents from "./event";
  import util from "@/engine/utils";
  import { defineAsyncComponent } from 'vue';
  import TourSteps from "./tour";
  //import AppToolbar from "@/engine/views/AppToolbar";
  //import AppFooter from "@/engine/views/AppFooter";
  //import {Multipane, MultipaneResizer} from "vue-multipane";
  //import draggable from "vuedraggable";
  const isElectron = false;
  let electron = null; let Menu = undefined; let MenuItem = undefined; let globalShortcut = undefined;
  //========= updating =========//
  import AppUpdater from "@/engine/updater/AppUpdater";

  // require("vue-tour/dist/vue-tour.css");

  export default {
    components: {
      AppToolbar : ()=> import("@/engine/views/AppToolbar"),
      // Multipane : ()=> import("vue-multipane").then(({Multipane})=> Multipane),
      // MultipaneResizer : ()=> import("vue-multipane").then(({MultipaneResizer})=>MultipaneResizer),
      draggable : ()=> import("vuedraggable"),
      AsyncComponent : defineAsyncComponent(() => import("@/engine/AsyncComponent")),
      AppFooter : ()=> import("@/engine/views/AppFooter"),
      AppUpdater,
      // Modern Components
      ModernToolbar: defineAsyncComponent(() => import("@/engine/components/modern/ModernToolbar")),
      ModernTabs: defineAsyncComponent(() => import("@/engine/components/modern/ModernTabs")),
      ModernPanel: defineAsyncComponent(() => import("@/engine/components/modern/ModernPanel")),
      ModernPanelLayout: defineAsyncComponent(() => import("@/engine/components/modern/ModernPanelLayout"))
      //AppUpdater : () => import("@/engine/updater/AppUpdater")
    },
    data() {
      return {
        expanded: true,
        firstUseDialog: false, // Disabled first use dialog
        endDialog: false,
        endDialogText: TourSteps.endDialog.content.pt,
        endDialogTitle: TourSteps.endDialog.title.pt,
        tourStep: TourSteps.pt,
        rightTabIndex: 0,
        bottomTabIndex: 0,
        primaryContentWidth: 800, // Default width for primary content
        mainAreaHeight: 600, // Default height for main area when bottom panel exists
        bottomPanelHeight: 150, // Default height for bottom panel (reduced)
        tourCallbacks: {
          onPreviousStep: this.tourPreviousStep,
          onNextStep: this.tourNextStep,
          onStop: this.tourStop
        },
        tourOptions: {
          labels: TourSteps.button.pt
        },
        tourLang: "pt"
      };
    },
    computed: {
      rightTabs() {
        return (this.$global.ui.rightTab || []).map(tab => ({
          id: tab.name,
          title: tab.title,
          component: tab.component,
          icon: tab.icon,
          closable: true
        }));
      },
      bottomTabs() {
        return (this.$global.ui.bottomTab || []).map(tab => ({
          id: tab.name,
          title: tab.title,
          component: tab.component,
          icon: tab.icon,
          closable: true
        }));
      },
      mainLayoutPanels() {
        const panels = [
          {
            id: 'main',
            size: this.$global.ui.bottomTab.length > 0 ? '70%' : '100%',
            minSize: 400,
            resizable: this.$global.ui.bottomTab.length > 0,
            storageKey: 'main-area'
          }
        ];
        
        if (this.$global.ui.bottomTab.length > 0) {
          panels.push({
            id: 'bottom',
            title: 'Painel Inferior',
            icon: 'fa-window-maximize',
            size: '30%',
            minSize: 150,
            maxSize: 500,
            resizable: true,
            collapsible: true,
            storageKey: 'bottom-panel'
          });
        }
        
        return panels;
      },
      horizontalPanels() {
        const panels = [
          {
            id: 'primary',
            size: '70%',
            minSize: 300,
            resizable: true,
            storageKey: 'primary-content'
          }
        ];
        
        if (this.$global.ui.rightTab.length > 0) {
          panels.push({
            id: 'right',
            title: 'Painel Lateral',
            icon: 'fa-window-restore',
            size: '30%',
            minSize: 250,
            maxSize: 600,
            resizable: true,
            collapsible: true,
            storageKey: 'right-sidebar'
          });
        }
        
        return panels;
      }
    },
    mounted: function() {
      // Load saved panel sizes
      try {
        const savedPrimaryWidth = localStorage.getItem('primary-content-width');
        if (savedPrimaryWidth) {
          this.primaryContentWidth = parseInt(savedPrimaryWidth, 10);
        }
        
        const savedMainHeight = localStorage.getItem('main-area-height');
        if (savedMainHeight) {
          this.mainAreaHeight = parseInt(savedMainHeight, 10);
        }
        
        const savedBottomHeight = localStorage.getItem('bottom-panel-height');
        if (savedBottomHeight) {
          this.bottomPanelHeight = parseInt(savedBottomHeight, 10);
        }
      } catch(e) {}
    },
    async created() {
      AppEvents.forEach(item => {
        this.$global.$on(item.name, item.callback);
      });
      window.getApp = this;
      // Detectar idioma salvo ou do navegador
      try {
        const savedLang = localStorage.getItem('kb_lang');
        const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        const lang = savedLang || (navLang.startsWith('pt') ? 'pt' : 'en');
        this.setLanguage(lang);
      } catch(e) { this.setLanguage('pt'); }
      //======== INIT ========//
      //----- load color -----//
      this.$vuetify.theme.primary = this.$global.setting.color;
      this.$global.$on("board-change",await this.renderComponents);
      //----- check for update -----// (no web)
      if (electron && electron.ipcRenderer) {
        this.$global.$on("check-update", this.checkUpdate);
      }
      this.$global.$on("render-packages", await this.renderComponents);
      // web-only: sem handlers IPC
      if (this.$track && typeof this.$track.pageview === 'function') {
        this.$track.pageview("/", "/home", document.title).then((response) => {
          window.getApp.$track.clientID = response.clientID;
          window.getApp.$track.set("clientID", response.clientID);
          return response;
        }).catch((err) => { return err; });
      }
    },
    methods: {
      setLanguage(lang){
        if (lang === 'pt') {
          this.endDialogTitle = TourSteps.endDialog.title.pt;
          this.endDialogText = TourSteps.endDialog.content.pt;
          this.tourStep = TourSteps.pt;
          this.tourOptions.labels = TourSteps.button.pt;
        } else if (lang === 'th') {
          this.endDialogTitle = TourSteps.endDialog.title.th;
          this.endDialogText = TourSteps.endDialog.content.th;
          this.tourStep = TourSteps.th;
          this.tourOptions.labels = TourSteps.button.th;
        } else {
          this.endDialogTitle = TourSteps.endDialog.title.en;
          this.endDialogText = TourSteps.endDialog.content.en;
          this.tourStep = TourSteps.en;
          this.tourOptions.labels = TourSteps.button.en;
        }
        this.tourLang = lang;
      },
      closeTab(name) {
        this.$global.ui.removeAllTab(name);
      },
      closeRightTab(index) {
        const tab = this.$global.ui.rightTab[index];
        if (tab) {
          this.$global.ui.removeAllTab(tab.name);
        }
      },
      closeBottomTab(index) {
        const tab = this.$global.ui.bottomTab[index];
        if (tab) {
          this.$global.ui.removeAllTab(tab.name);
        }
      },
      onMainPaneResize(pane, container, size) {
        // Handle main vertical resize (top/bottom split)
        if (pane && pane.style && pane.style.height) {
          const newHeight = parseInt(pane.style.height, 10);
          this.mainAreaHeight = Math.max(400, Math.min(window.innerHeight - 200, newHeight));
          
          try {
            localStorage.setItem('main-area-height', String(this.mainAreaHeight));
          } catch(e) {}
        }
      },
      onHorizontalPaneResize(pane, container, size) {
        // Handle horizontal resize (left/right split)
        if (pane && pane.style && pane.style.width) {
          const newWidth = parseInt(pane.style.width, 10);
          this.primaryContentWidth = Math.max(300, Math.min(window.innerWidth - 300, newWidth));
          
          try {
            localStorage.setItem('primary-content-width', String(this.primaryContentWidth));
          } catch(e) {}
        }
      },
      minimizeBottomPanel() {
        this.bottomPanelHeight = 40; // Minimize to just show header
        try {
          localStorage.setItem('bottom-panel-height', String(this.bottomPanelHeight));
        } catch(e) {}
      },
      closeBottomPanel() {
        // Close all bottom tabs
        this.$global.ui.bottomTab = [];
      },
      initialTab(){

      },
      renderComponents : async function(){
        await this.createToolbar(window.getApp.$refs.toolbar);
      },
      createToolbar : async function(t)
      {
        console.log("toolbar created");
        setTimeout(()=>{
          if(window.getApp) {
            window.getApp.$refs.toolbar.processStaticToolbar(t);
            //----- load external plugin -----//
            window.getApp.reloadBoardPackage().then(() => {
              window.getApp.$refs.toolbar.processToolbar(t);
            });
            //----- load app packages ----//
            window.getApp.loadAppPackage().then(() => {
              window.getApp.$refs.toolbar.processAppToolbar(t);
            });
          }
        },1000);
      },
      buildPackageMenu : async function(packages){
        if(Menu === undefined){
          return;
        }
        let menu = Menu.getApplicationMenu(); // get electron menu
        for(let package_key in packages){
          let pack = packages[package_key];
          if(pack.config && pack.config.menu){
            let pack_menu = pack.config.menu;
            for(let pack_menu_item_key in pack_menu){
              let pack_menu_item = pack_menu[pack_menu_item_key];
              let target_menu = menu.items.find(item=>item.label === pack_menu_item.main);
              if(target_menu == null){ //new main menu, let create main menu first
                let main_menu = new MenuItem({label : pack_menu_item.main, submenu : []});
                if(pack_menu_item.main_index){
                  menu.insert(pack_menu_item.main_index,main_menu);
                }else{
                  menu.append(main_menu);
                }
                Menu.setApplicationMenu(menu);
                target_menu = menu.items.find(item=>item.label === pack_menu_item.main);
              }
              if(target_menu){
                pack_menu_item.click = () => this.$global.$emit(pack_menu_item.event_emit);
                globalShortcut.unregister(pack_menu_item.accelerator);
                globalShortcut.register(pack_menu_item.accelerator, () => {
                  console.log("Emiting event...");
                  this.$global.$emit(pack_menu_item.event_emit);
                });
                let item = new MenuItem(pack_menu_item);
                let target_submenu = target_menu.submenu.items.find(item=>item.label === pack_menu_item.label);
                if(target_submenu){ //existing, new i cannot remove it so let camouflage it.
                  let old_submenu = target_menu.submenu.items.splice(0); //Shallow copy, aka clone;
                  let new_submenu = old_submenu.filter(item=>item.label !== pack_menu_item.label);
                  new_submenu.push(item);
                  target_menu.submenu.clear(); // this didn't link to items
                  target_menu.submenu.items = [];
                  for(let item in new_submenu){
                    target_menu.submenu.append(new_submenu[item]); //this linked to items , wtf electron?
                  }
                }else {
                  target_menu.submenu.append(item);
                }
              }
            }
          }
        }
      },
      loadPackage : async function(packageInfo){
        return new Promise((resolve,reject)=>{
          let bp = {};
          // re-assign package to board
          Object.keys(packageInfo).forEach(packageName => {
            bp[packageName] = {};
            let boardPackageData = util.loadCofigComponents(packageInfo[packageName].config,
              "package." + packageName);
            bp[packageName] = boardPackageData.data;
          });

          Object.keys(packageInfo).forEach((packageName, index, arr) => {
            let targetJsFile = packageInfo[packageName].js;
            let targetCssFile = packageInfo[packageName].css;
            let targetLinkFile = `file:///${targetJsFile}`;
            let targetLinkCssFile = `file:///${targetCssFile}`;
            if (util.fs.existsSync(targetJsFile)) {
              let script = document.createElement("script");
              script.setAttribute("src", targetLinkFile);
              script.onload = function() {
                if (packageName in window) {
                  Vue.use(window[packageName]);
                  bp[packageName].loaded = true;
                  console.log(`loaded package : ${packageName}`);
                  if (index === arr.length - 1) {
                    resolve(bp);
                  }
                }
              };
              document.head.prepend(script);
            }
            if(util.fs.existsSync(targetCssFile)){
              let css = document.createElement("link");
              css.setAttribute("rel","stylesheet");
              css.setAttribute("type","text/css");
              css.setAttribute("href",targetLinkCssFile);
              document.head.prepend(css);
            }
          });
        });
      },
      loadAppPackage : async function(){
        let appPackage = await pm.listPackage();
        console.log("-------- app package --------");
        console.log(appPackage);
        await this.buildPackageMenu(appPackage);
        this.$global.packages = await this.loadPackage(appPackage);
        this.$global.$emit("app-package-loaded");
        console.log("emitting app-package-loaded");
      },
      reloadBoardPackage : async function() {
        let boardName = this.$global.board.board;
        //bm.clearListedBoard();
        let boardPackage = await bm.packages(boardName);
        console.log("--------- board package ---------");
        console.log(boardPackage);
        await this.buildPackageMenu(boardPackage);
        this.$global.board.package = await this.loadPackage(boardPackage);
        this.$global.$emit("board-package-loaded");
        console.log("emitting board-package-loaded");
      },
      onResizePanel(pane, container, size) {
        this.$global.$emit("panel-resize", size);
        if (this.$refs.rtabs) {
          this.$refs.rtabs.onResize();
        }
      },
      skipTour: function() {
        this.tourStop();
      },
      startTour: function(lang) {
        this.firstUseDialog = false;
        this.$global.setting.firstUse = true;
        try { localStorage.setItem('kb_lang', lang); } catch(e){}
        this.setLanguage(lang);
        this.$tours["ideTour"].start();
      },
      tourNextStep: function(step) {
        try {
          switch (step) {
            case 3:
              document.querySelector(this.tourStep[step].target + " > span > span > button").click();
              break;
            case 4:
              document.querySelector(
                "#inspire > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__text > div > div > div > div:nth-child(2) > div > div").click();
              break;
            case 5:
              // this is last step tour
              this.tourStop();
              document.querySelector(this.tourStep[step].target).click();
              break;
            case 6:
              document.querySelector(
                "#inspire > div.v-dialog__content.v-dialog__content--active > div > div.v-card.v-sheet.v-sheet--tile.theme--light > div.v-card__actions > span > button:nth-child(2)").click();
              break;
            case 7:
              document.querySelector(this.tourStep[step].target + " > span > span > button").click();
              break;
            case 8:
              document.querySelector(
                "#inspire > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button:nth-child(2)").click();
              break;
            case 9:
              document.querySelector(this.tourStep[step].target + " > span > span > button").click();
              break;
            case 10:
              document.querySelector(
                "#inspire > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button").click();
              break;
            case 11:
              document.querySelector(this.tourStep[step].target + " > span > span > button").click();
              break;
            case 12:
              document.querySelector(
                "#inspire > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button").click();
              break;
            case 13:
              document.querySelector(
                "#inspire > div.application--wrap > nav > div > span:nth-child(6) > span > button"
              ).click();
              break;
          }
        } catch (e) {
          console.log(e);
        }
      },
      tourPreviousStep: function(step) {
        console.log(step);
        switch (step) {
          case 4:
            document.querySelector(
              "#inspire > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button:nth-child(2)"
            ).click();
            break;
          case 6:
            document.querySelector(
              "#inspire > div.v-dialog__content.v-dialog__content--active > div > div.v-card.v-sheet.v-sheet--tile.theme--light.v-tour-highlight.v-tour-position > div.v-card__actions > span > button:nth-child(1)"
            ).click();
            break;
          case 8:
            document.querySelector(
              "#inspire > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button:nth-child(2)"
            ).click();
            break;
          case 9:
            document.querySelector(this.tourStep[7].target + " > span > span > button").click();
            break;
          case 10:
            document.querySelector(
              "#inspire > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button"
            ).click();
            break;
          case 11:
            document.querySelector(this.tourStep[9].target + " > span > span > button").click();
            break;
          case 12:
            document.querySelector(
              "#inspire > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button"
            ).click();
            break;
          case 13:
            document.querySelector(this.tourStep[11].target + " > span > span > button").click();
            break;
          case 14:
            this.$global.ui.rightDrawer();
            break;
        }
      },
      tourStop: function() {

        if (this.$global.setting.firstUse === true) {
          if (this.tourLang === "th") {
            this.endDialogTitle = TourSteps.endDialog.title.th;
            this.endDialogText = TourSteps.endDialog.content.th;
          } else if (this.tourLang === "pt") {
            this.endDialogTitle = TourSteps.endDialog.title.pt;
            this.endDialogText = TourSteps.endDialog.content.pt;
          } else {
            this.endDialogTitle = TourSteps.endDialog.title.en;
            this.endDialogText = TourSteps.endDialog.content.en;
          }

          this.$global.setting.firstUse = false;
          this.endDialog = true;
          this.$global.editor.mode = 1;
          this.$global.$emit("editor-mode-change", 1);

          this.firstUseDialog = false;
          this.$global.setting.firstUse = false;
        }

      }
    }
  };
  /*height:calc(100vh - 64px - 50px - 81px -23px); */
</script>
<style lang="stylus" scoped>
    .setting-fab
        top: 50% !important;
        right: 0;
        border-radius: 0

    .page-wrapper
        height: calc(100vh - 64px -23px);

    .v-footer {
        min-height: 10px !important;
    }

    .page-navigation-display {
        minWidth: 500px;
        width: 100%;
        height: 100%;
        background-color: transparent;
    }

    .multiplate-warper {
        height: calc(100vh - 64px - 23px);
    }

    .multiplate-warper > .vertical-panes > .multipane-resizer {
        height: 100%;
        background: #BBB;
        width: 5px;
    }

    .multiplate-warper .multipane-resizer {
        height: 5px;
        top: 0px;
        margin: 0;
        left: 0; /* reset default styling */
        background: #BBB;
    }

    .vertical-panes {
        min-height: 200px;
        height: 65%;
    }

    .v-tabs {
        display: flex;
        flex-direction column;
        width: 100%;
    }

    .bottom-tab {
        display: flex;
        flex-grow: 1;
    }

    .close-tab-btn-control {
        margin-right: -5px;
    }

    .v-tabs__slider {
        height: 4px !important;
    }
</style>
<style>
    @import '@/engine/styles/app-toolbar.css';
    @import '@/engine/styles/modern-ui.css';
    @import '@/engine/styles/modern-blockly.css';
    
    /* Modern Layout Styles */
    .modern-layout__primary {
        flex: 1;
        overflow: hidden;
    }
    
    .modern-layout__horizontal {
        height: 100%;
        display: flex;
    }
    
    /* Modern Drawer Styles */
    .modern-drawer {
        position: fixed;
        top: 0;
        bottom: 0;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modern-drawer--left {
        left: 0;
        right: 0;
        justify-content: flex-start;
        padding-left: 20px;
    }
    
    .modern-drawer--right {
        left: 0;
        right: 0;
        justify-content: flex-end;
        padding-right: 20px;
    }
    
    .modern-drawer__content {
        max-width: 400px;
        width: 100%;
        max-height: 80vh;
        overflow: auto;
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .modern-drawer--right .modern-drawer__content {
        animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    /* Modern Resizable Layouts */
    .main-vertical-layout {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .main-horizontal-layout {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: row;
    }

    .full-height-layout {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .upper-area {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .primary-content {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        background: var(--kb-surface);
        overflow: hidden;
    }

    .right-sidebar {
        display: flex;
        flex-direction: column;
        background: var(--kb-surface-2);
        border-left: 1px solid var(--kb-border);
        overflow: hidden;
    }

    .bottom-panel {
        display: flex;
        flex-direction: column;
        background: var(--kb-surface-2);
        border-top: 1px solid var(--kb-border);
        overflow: hidden;
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

    .modern-panel-resizer {
        background: var(--kb-border) !important;
        transition: background-color 0.2s ease !important;
    }

    .modern-panel-resizer:hover {
        background: var(--kb-primary) !important;
    }

    .modern-panel-resizer--horizontal {
        height: 4px !important;
        cursor: row-resize !important;
    }

    /* Modern Button Styles */
    .modern-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 16px;
        border: none;
        border-radius: var(--kb-radius);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        background: var(--kb-surface-3);
        color: var(--kb-text-secondary);
    }

    .modern-btn:hover {
        background: var(--kb-surface-hover);
        color: var(--kb-text-primary);
    }

    .modern-btn--primary {
        background: var(--kb-primary);
        color: white;
    }

    .modern-btn--primary:hover {
        background: var(--kb-primary-hover);
    }

    .modern-btn--outline {
        background: transparent;
        border: 1px solid var(--kb-border);
        color: var(--kb-text-primary);
    }

    .modern-btn--outline:hover {
        border-color: var(--kb-primary);
        color: var(--kb-primary);
    }
    
    .v-window {
        display: flex;
        width: 100%;
        flex: 1 1 auto;
    }

    .v-window__container {
        display: flex;
        width: 100%;
    }

    .v-window-item {
        display: flex;
        width: 100%;
    }

    .v-step {
        z-index: 99999 !important;
    }

    .bottom-tab .v-tabs__container {
        height: 26px !important;
    }

    .v-tour-highlight {
        pointer-events: none !important;
    }
</style>

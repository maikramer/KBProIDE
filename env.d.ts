/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $global: any;
    $engine: any;
    $db: any;
    $db2: any;
    $db_dev: any;
    $track: any;
    $vuetify?: any;
  }
}

declare global {
  // various globals used in legacy code
  var global: any;
  interface Window { streamCamera?: any }
  const monaco: any;
}

declare module '@/engine/views/dialog/VariableNamingDialog';
declare module '@/engine/views/dialog/PianoDialog';
declare module '@/engine/views/dialog/TTSDialog';
declare module '@/engine/views/widgets/list/SmoothScrollbar';



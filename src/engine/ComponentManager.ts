import utils from '@/engine/utils';

type ComponentMap = Record<string, Record<string, any>>;

let listedComponents: ComponentMap = {};

const listComponent = function(): ComponentMap {
  // Webpack require.context não está disponível no runtime web moderno com TS aqui;
  // para web-only retornamos mapeamento mínimo, componentes serão carregados explicitamente
  const context: ComponentMap = {};
  // Ordenação por config.index quando disponível
  const ordered: ComponentMap = {};
  Object.keys(context).sort((a, b)=>{
    const ca = (context as any)[a]?.config; const cb = (context as any)[b]?.config;
    if (ca && cb && typeof ca.index === 'number' && typeof cb.index === 'number') { return ca.index - cb.index; }
    return 0;
  }).forEach(k=>{ ordered[k] = (context as any)[k]; });
  return ordered;
};

const components = function(): ComponentMap {
  if (Object.keys(listedComponents).length === 0) {
    listedComponents = listComponent();
  }
  return listedComponents;
};

export default {
  components,
  listComponent,
  listToolbar : utils.filterFileName(components(),'Toolbar'),
  listActionbar : utils.filterFileName(components(),'Actionbar'),
  listPage : utils.filterFileName(components(),'Page'),
  listLeftDrawer : utils.filterFileName(components(),'LeftDrawer'),
  listRightDrawer : utils.filterFileName(components(),'RightDrawer'),
  listBottomPanel : utils.filterFileName(components(),'BottomPanel'),
  listRightTab : utils.filterFileName(components(),'RightTab'),
  listBottomTab : utils.filterFileName(components(),'BottomTab'),
  listSetting : utils.filterFileName(components(),'Setting'),
  load : ()=>{}, install : (_ns: string)=>{}, remove : (_ns: string)=>{}, update : (_ns: string)=>{}
}



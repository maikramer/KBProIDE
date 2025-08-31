import util from "@/engine/utils";

export type PluginCategory = { directory?: string; dirName?: string; category?: any; plugins?: Record<string, any>; examples?: any[] };
export type PluginInfo = { categories: PluginCategory[]; plugins: Record<string, any> };

let localBoardName = "";
let localPlugins: PluginInfo = { categories: [], plugins: {} };

const listCategoryPlugins = function(_pluginDir: string, _boardInfo: any): { categories: PluginCategory[]; plugins: Record<string, any> } {
  // Web-only: sem acesso a FS; retornar vazio
  return { categories: [], plugins: {} };
};

const loadPlugin = function(boardInfo: any): PluginInfo {
  if ((Object.keys(localPlugins.plugins).length === 0) || (boardInfo?.name !== localBoardName)) {
    const platformPlugins = listCategoryPlugins(`${util.platformDir}/${boardInfo.platform}/plugin`, boardInfo);
    const boardPlugins = listCategoryPlugins(`${util.boardDir}/${boardInfo.name}/plugin`, boardInfo);
    const globalPlugins = listCategoryPlugins(util.pluginDir, boardInfo);
    const allPlugins: Record<string, any> = {};
    Object.assign(allPlugins, platformPlugins.plugins, boardPlugins.plugins, globalPlugins.plugins);
    const allCats = ([] as PluginCategory[]).concat(globalPlugins.categories, platformPlugins.categories, boardPlugins.categories);
    localPlugins = { categories: allCats, plugins: allPlugins };
    localBoardName = boardInfo?.name || '';
  }
  return localPlugins;
};

const clearListedPlugin = function() { localPlugins = { categories: [], plugins: {} }; };
const plugins = function(boardInfo: any) { return loadPlugin(boardInfo).categories; };

const listOnlinePlugin = async (query: any) => {
  const api: any = (window as any).app?.config?.globalProperties?.$db2 || null;
  if (!api || typeof api.getItems !== 'function') { throw new Error('db2 unavailable'); }
  const res = await api.getItems("plugins", query);
  return { plugins: res.data, meta: res.meta };
};

// Operações nativas indisponíveis no web-only
const installOnlinePlugin = async (_info: any, _cb?: (p:any)=>void) => { throw new Error('Instalação de plugins indisponível no modo web'); };
const removePlugin = async (_info: any, _isBackupRemove = false) => { throw new Error('Remoção de plugins indisponível no modo web'); };
const backupPlugin = async (_info: any) => { throw new Error('Backup indisponível no modo web'); };
const restorePlugin = async (_info: any) => { throw new Error('Restore indisponível no modo web'); };
const publishPlugin = async (_url: string) => { throw new Error('Publicação indisponível no modo web'); };

export default {
  listPlugin: (_dir: string) => ({}),
  loadPlugin,
  plugins,
  listOnlinePlugin,
  installOnlinePlugin,
  clearListedPlugin,
  removePlugin,
  backupPlugin,
  restorePlugin,
  publishPlugin
};



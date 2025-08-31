import util from "@/engine/utils";

export type BoardInfo = {
  name: string;
  title?: string;
  platform?: string;
  dir?: string;
  version?: string;
  image?: string;
  description?: string;
};

type PackageConfig = {
  index?: number;
  components?: string[];
};

type PackageEntry = {
  config: PackageConfig;
  dir?: string;
  js?: string;
  scope?: "board" | "platform";
};

type PackageMap = Record<string, PackageEntry>;

let listedBoards: BoardInfo[] = [];
let listedPackages: PackageMap = {};
let listedPackagesBoard = "";

// Web-only: boards são obtidas de dados empacotados (pasta public/boards.json no futuro) ou cache
const listBoard = async (): Promise<BoardInfo[]> => {
  try {
    // Fallback mínimo: expor apenas ESP32; pode ser trocado por fetch('/static/data/boards.json')
    return [ { name: 'esp32', title: 'ESP32', platform: 'arduino-esp32', dir: '' } ];
  } catch {
    return [];
  }
};

const listPackage = async (boardName: string, includePlatform = true): Promise<PackageMap> => {
  // Web-only: sem leitura de disco; retornar mapa vazio (placeholders) até termos catálogo via HTTP
  const context: PackageMap = {};
  // Ordenação por index preservada caso algum pacote seja carregado dinamicamente
  const ordered: PackageMap = {};
  Object.keys(context).sort((a, b) => {
    const ca = context[a].config; const cb = context[b].config;
    if (ca && cb && typeof ca.index === 'number' && typeof cb.index === 'number') {
      return (ca.index as number) - (cb.index as number);
    }
    return 0;
  }).forEach(k => { ordered[k] = context[k]; });
  return ordered;
};

const listOnlineBoard = async (query: any) => {
  // Usa o cliente exposto em main.ts via provide ($db2). No browser, pode não existir.
  const api: any = (window as any).app?.config?.globalProperties?.$db2 || null;
  if (!api || typeof api.getItems !== 'function') { throw new Error('db2 unavailable'); }
  const data = await api.getItems("boards", query);
  return { boards: data.data, meta: data.meta };
};

const loadBoardManagerConfig = async () => {
  // Web-only: não há config local; retornar null
  return null as any;
};

// As seguintes operações eram nativas (zip, fs). No web-only, expomos no-op ou lançamos erro amigável.
const installOnlineBoard = async (_info: any, _cb?: (p: any)=>void) => {
  throw new Error('Instalação de placas indisponível no modo web');
};
const removeBoard = async (_boardInfo: any) => { throw new Error('Remoção de placas indisponível no modo web'); };
const removeBackupBoard = async (_boardInfo: any) => { throw new Error('Backup indisponível no modo web'); };
const backupBoard = async (_boardInfo: any) => { throw new Error('Backup indisponível no modo web'); };
const restoreBoard = async (_boardInfo: any) => { throw new Error('Restore indisponível no modo web'); };
const publishBoard = async (_url: string) => { throw new Error('Publicação indisponível no modo web'); };

const boards = async (): Promise<BoardInfo[]> => {
  if (listedBoards.length === 0) {
    listedBoards = await listBoard();
  }
  return listedBoards;
};
const clearListedBoard = function() {
  listedBoards = [];
};
const packages = async function(selectedBoard: string): Promise<PackageMap> {
  if ((Object.keys(listedPackages).length === 0) || (listedPackagesBoard !== selectedBoard)) {
    listedPackages = await listPackage(selectedBoard);
    listedPackagesBoard = selectedBoard;
  }
  return listedPackages;
};

const filterBoardPackageComponent = function(localPackage: PackageMap, name: string): Record<string, string[]> {
  const components: Record<string, string[]> = {};
  Object.keys(localPackage).forEach(packageName => {
    const conf = localPackage[packageName]?.config;
    components[packageName] = [];
    if (conf && Array.isArray(conf.components)) {
      conf.components.forEach((componentName: string) => {
        if ((componentName || '').toLowerCase().startsWith(name.toLowerCase())) {
          if (!components[packageName].includes(componentName)) {
            components[packageName].push(componentName);
          }
        }
      });
    }
  });
  return components;
};

export default {
  boards,
  clearListedBoard,
  packages,
  listBoard,
  listOnlineBoard,
  listPackage,
  listToolbar: async (selectedBoard: string) => filterBoardPackageComponent(await packages(selectedBoard), "Toolbar"),
  listActionbar: async (selectedBoard: string) => filterBoardPackageComponent(await packages(selectedBoard), "Actionbar"),
  listPage: async (selectedBoard: string) => filterBoardPackageComponent(await packages(selectedBoard), "Page"),
  listLeftDrawer: async (selectedBoard: string) => filterBoardPackageComponent(await packages(selectedBoard), "LeftDrawer"),
  listRightDrawer: async (selectedBoard: string) => filterBoardPackageComponent(await packages(selectedBoard), "RightDrawer"),
  listBottomPanel: async (selectedBoard: string) => filterBoardPackageComponent(await packages(selectedBoard), "BottomPanel"),
  listRightTab: async (selectedBoard: string) => filterBoardPackageComponent(await packages(selectedBoard), "RightTab"),
  listBottomTab: async (selectedBoard: string) => filterBoardPackageComponent(await packages(selectedBoard), "BottomTab"),
  loadBoardManagerConfig,
  installOnlineBoard,
  removeBoard,
  removeBackupBoard,
  backupBoard,
  restoreBoard,
  publishBoard
};



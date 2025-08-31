import util from "@/engine/utils";

type PackageConfig = { index?: number; components?: string[] };
type PackageEntry = { config: PackageConfig; dir?: string; js?: string; css?: string; scope?: string };
type PackageMap = Record<string, PackageEntry>;

let listedPackages: PackageMap = {};

const listPackage = async (): Promise<PackageMap> => {
  // Web-only: sem leitura local. Retornar vazio até termos catálogo remoto.
  return {};
};

const listOnlinePackage = async (query: any) => {
  const api: any = (window as any).app?.config?.globalProperties?.$db2 || null;
  if (!api || typeof api.getItems !== 'function') { throw new Error('db2 unavailable'); }
  const res = await api.getItems("packages", query);
  return { packages: res.data, meta: res.meta };
};

const loadPackageManagerConfig = async () => {
  return null as any;
};

// Operações nativas indisponíveis no web-only
const installOnlinePackage = async (_info: any, _cb?: (p: any)=>void) => { throw new Error('Instalação de pacotes indisponível no modo web'); };
const removePackage = async (_info: any) => { throw new Error('Remoção de pacotes indisponível no modo web'); };
const removeBackupPackage = async (_info: any) => { throw new Error('Backup indisponível no modo web'); };
const backupPackage = async (_info: any) => { throw new Error('Backup indisponível no modo web'); };
const restorePackage = async (_info: any) => { throw new Error('Restore indisponível no modo web'); };
const publishPackage = async (_url: string) => { throw new Error('Publicação indisponível no modo web'); };

const clearListedPackage = function() {
  listedPackages = {};
};

const packages = async function(): Promise<PackageMap> {
  if (Object.keys(listedPackages).length === 0) {
    listedPackages = await listPackage();
  }
  return listedPackages;
};

const filterPackageComponent = function(localPackage: PackageMap, name: string): Record<string, string[]> {
  const components: Record<string, string[]> = {};
  Object.keys(localPackage).forEach(packageName => {
    const conf = localPackage[packageName]?.config;
    components[packageName] = [];
    if (conf && Array.isArray(conf.components)) {
      conf.components.forEach(componentName => {
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
  clearListedPackage,
  packages,
  listPackage,
  listOnlinePackage,
  listToolbar: async() => filterPackageComponent(await packages(), "Toolbar"),
  listActionbar: async() => filterPackageComponent(await packages(), "Actionbar"),
  listPage: async() => filterPackageComponent(await packages(), "Page"),
  listLeftDrawer: async()  => filterPackageComponent(await packages(), "LeftDrawer"),
  listRightDrawer: async()  => filterPackageComponent(await packages(), "RightDrawer"),
  listBottomPanel: async()  => filterPackageComponent(await packages(), "BottomPanel"),
  listRightTab: async()  => filterPackageComponent(await packages(), "RightTab"),
  listBottomTab: async()  => filterPackageComponent(await packages(), "BottomTab"),
  loadPackageManagerConfig,
  installOnlinePackage,
  removePackage,
  removeBackupPackage,
  backupPackage,
  restorePackage,
  publishPackage
};



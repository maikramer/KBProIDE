import util from "@/engine/utils";

type PlatformInfo = { name: string; status?: string; zip?: string };

const getPlatformInfo = async (name: string): Promise<PlatformInfo[]> => {
  const api: any = (window as any).app?.config?.globalProperties?.$db2 || null;
  if (!api || typeof api.getItems !== 'function') { throw new Error('db2 unavailable'); }
  const query = { filter: { name: { eq: name } } } as any;
  const { data } = await api.getItems("platforms", query);
  return data as PlatformInfo[];
};

const installPlatformByName = async (name: string, _cb?: (p: any)=>void) => {
  const infoArr = await getPlatformInfo(name);
  if (!infoArr || infoArr.length === 0) { throw new Error('no platform info'); }
  const info = infoArr[0];
  if (info.status !== 'published') { throw new Error('platform is not published yet'); }
  // Web-only: instalação local não suportada; delegar a backend ou fornecer SDK online
  throw new Error('Instalação de plataforma indisponível no modo web');
};

const updatePlatformByName = async (_name: string) => {
  // Web-only placeholder
  return false;
};

export default {
  installPlatformByName,
  updatePlatformByName,
};



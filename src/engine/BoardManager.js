// Simple stub for BoardManager
export default {
  listBoard: async () => [],
  listPackage: async () => ({}),
  listToolbar: async () => ({}),
  listActionbar: async () => ({}),
  listRightDrawer: async () => ({}),
  listBottomPanel: async () => ({}),
  listRightTab: async () => ({}),
  listBottomTab: async () => ({}),
  boards: async () => [
    { name: 'esp32', title: 'ESP32', platform: 'arduino-esp32' }
  ],
  packages: async () => ({}),
  loadBoardManagerConfig: () => {},
  installOnlineBoard: async () => {},
  removeBoard: async () => {}
};

<template>
  <div class="editor-topbar">
    <div class="left">
      <button class="btn" @click="$emit('new-file')" title="Novo (Ctrl+N)">
        <i class="fa fa-file-text-o"></i>
      </button>
      <button class="btn" @click="$emit('open-file')" title="Abrir (Ctrl+O)">
        <i class="fa fa-folder-open"></i>
      </button>
      <button class="btn" @click="$emit('save-file')" title="Salvar (Ctrl+S)">
        <i class="fa fa-floppy-o"></i>
      </button>
      <div class="divider"></div>
      <button class="btn" :class="{ active: mode===1 }" @click="$emit('set-mode',1)" title="Blocos">
        <i class="fa fa-puzzle-piece"></i>
      </button>
      <button class="btn" :class="{ active: mode===2 }" @click="$emit('set-mode',2)" title="Pré-visualizar">
        <i class="fa fa-eye"></i>
      </button>
      <button class="btn" :class="{ active: mode===3 }" @click="$emit('set-mode',3)" title="Código">
        <i class="fa fa-code"></i>
      </button>
    </div>
    <div class="right">
      <div class="board-select hidden-sm-and-down">
        <label class="label">Placa</label>
        <select v-model="selectedBoard" @change="onBoardSelect">
          <option v-for="b in boards" :key="b.name" :value="b.name">{{ b.title }}</option>
        </select>
      </div>
      <button class="btn" @click="toggleTheme" :title="$vuetify.dark ? 'Claro' : 'Escuro'">
        <i class="fa" :class="$vuetify.dark ? 'fa-sun-o' : 'fa-moon-o'"></i>
      </button>
      <button class="btn" @click="openCommandPalette" title="Comandos (Ctrl+K / Ctrl+P)">
        <i class="fa fa-terminal"></i>
      </button>
      <slot name="right"></slot>
    </div>
  </div>
  <CommandPalette
    v-model="paletteOpen"
    :actions="paletteActions"
    @run="onPaletteRun"
  />
  
</template>

<script>
import CommandPalette from "@/engine/components/common/CommandPalette.vue";
export default {
  name: 'EditorTopbar',
  emits: [
    'new-file','open-file','save-file','set-mode',
    'newFile','openFile','saveFile','setMode'
  ],
  props: { mode: { type: Number, default: 1 } },
  data(){
    const defaultBoards = [
      { name: 'esp32', title: 'ESP32', platform: 'arduino-esp32' }
    ];
    const available = (this.$global && this.$global.board && this.$global.board.available) ? this.$global.board.available : defaultBoards;
    const boards = available.filter(b => (b.name || '').toLowerCase().includes('esp32'));
    const current = (this.$global && this.$global.board && this.$global.board.board_info && this.$global.board.board_info.name && (this.$global.board.board_info.name.toLowerCase().includes('esp32'))) ? this.$global.board.board_info.name : (boards[0] ? boards[0].name : 'esp32');
    return { boards, selectedBoard: current, paletteOpen: false, zen: false };
  },
  components: { CommandPalette },
  mounted(){ window.addEventListener('keydown', this.handleGlobalHotkeys); this.bindGlobalHotkeyBus(); },
  beforeUnmount(){ window.removeEventListener('keydown', this.handleGlobalHotkeys); this.unbindGlobalHotkeyBus(); },
  methods: {
    bindGlobalHotkeyBus(){
      try {
        this.$global.$on && this.$global.$on('hotkey', this.handleHotkeyEvent);
        this.$global.$on && this.$global.$on('open-command-palette', this.openCommandPalette);
        this.$global.$on && this.$global.$on('toggle-zen', this.toggleZen);
      } catch(e){}
    },
    unbindGlobalHotkeyBus(){
      try {
        this.$global.$off && this.$global.$off('hotkey', this.handleHotkeyEvent);
        this.$global.$off && this.$global.$off('open-command-palette', this.openCommandPalette);
        this.$global.$off && this.$global.$off('toggle-zen', this.toggleZen);
      } catch(e){}
    },
    toggleZen(){
      this.zen = !this.zen;
      try {
        if (this.zen) {
          this.$global.ui.bottomTab = [];
          this.$global.ui.rightTab = [];
        }
      } catch(e){}
    },
    handleHotkeyEvent(action){
      if (action === 'save') this.$emit('save-file');
      if (action === 'open') this.$emit('open-file');
      if (action === 'new') this.$emit('new-file');
    },
    handleGlobalHotkeys(e){
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); this.openCommandPalette(); }
    },
    toggleTheme(){
      this.$vuetify.dark = !this.$vuetify.dark;
      const root = document.documentElement;
      if (this.$vuetify.dark) root.classList.add('dark'); else root.classList.remove('dark');
      this.$global.setting.color = this.$vuetify.dark ? '#0f172a' : '#1976d2';
      try { this.$global.$emit('theme-dark', this.$vuetify.dark); } catch(e){}
      try { this.$global.$emit('theme-change', this.$global.setting.color); } catch(e){}
    },
    openCommandPalette(){
      this.paletteOpen = true;
    },
    onPaletteRun(){},
    onBoardSelect(){
      const info = this.boards.find(b => b.name === this.selectedBoard) || { name: this.selectedBoard, title: this.selectedBoard, platform: 'web', dir: '' };
      if (!this.$global.board) { this.$global.board = {}; }
      this.$global.board.board_info = Object.assign({ dir: '' }, info);
      this.$global.board.board = info.name;
      this.$global.editor.blockCode = '';
      this.$global.editor.rawCode = '';
      this.$global.$emit('board-change', this.$global.board.board_info);
      this.$global.$emit('editor-mode-change', this.$global.editor.mode, false, true);
      try { localStorage.setItem('kb_board', info.name); } catch(e){}
    },
  },
  computed: {
    paletteActions(){
      return [
        { name: 'Novo arquivo', run: ()=> this.$emit('new-file') },
        { name: 'Abrir arquivo', run: ()=> this.$emit('open-file') },
        { name: 'Salvar arquivo', run: ()=> this.$emit('save-file') },
        { name: 'Modo: Blocos', run: ()=> this.$emit('set-mode',1) },
        { name: 'Modo: Pré-visualizar', run: ()=> this.$emit('set-mode',2) },
        { name: 'Modo: Código', run: ()=> this.$emit('set-mode',3) },
        { name: 'Alternar tema escuro', run: ()=> this.toggleTheme() },
        { name: 'Abrir Gerenciador de Placas', run: ()=> { try { this.$global.$emit && this.$global.$emit('open-board-dialog'); } catch(e){} } },
        { name: 'Recarregar pacotes de placa', run: ()=> { try { window.getApp && window.getApp.reloadBoardPackage && window.getApp.reloadBoardPackage(); } catch(e){} } },
      ];
    }
  }
};
</script>

<style scoped>
.editor-topbar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  background: var(--kb-topbar-bg, #0f172a);
  color: var(--kb-topbar-fg, #e5e7eb);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.left, .right { display: flex; align-items: center; gap: 6px; }
.btn {
  height: 36px; min-width: 36px; padding: 0 10px;
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent; color: inherit; border: none; border-radius: 8px;
  cursor: pointer; transition: background .15s ease;
}
.btn:hover { background: rgba(255,255,255,0.08); }
.btn.active { background: rgba(59,130,246,.18); color: #93c5fd; box-shadow: 0 0 0 1px rgba(59,130,246,.25) inset; }
.board-select { display:flex; align-items:center; gap:6px; margin-left:8px; }
.board-select .label { font-size: 12px; opacity:.8; }
.board-select select { height: 32px; background: #111827; color:#e5e7eb; border: 1px solid rgba(255,255,255,.12); border-radius: 6px; padding: 0 8px; }
.divider { width: 1px; height: 24px; background: rgba(255,255,255,0.12); margin: 0 4px; }
i { font-size: 14px; }
@media (max-width: 640px) {
  .editor-topbar { padding: 0 4px; }
  .btn { min-width: 32px; height: 32px; }
}
</style>



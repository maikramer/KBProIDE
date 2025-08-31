<template>
  <div class="modern-editor-toolbar">
    <!-- Left Section - File Operations -->
    <div class="modern-editor-toolbar__section">
      <button 
        class="modern-editor-btn modern-editor-btn--icon" 
        @click="$emit('new-file')" 
        title="Novo Projeto (Ctrl+N)"
      >
        <i class="fa fa-file-o"></i>
      </button>
      <button 
        class="modern-editor-btn modern-editor-btn--icon" 
        @click="$emit('open-file')" 
        title="Abrir Projeto (Ctrl+O)"
      >
        <i class="fa fa-folder-open-o"></i>
      </button>
      <button 
        class="modern-editor-btn modern-editor-btn--icon" 
        @click="$emit('save-file')" 
        title="Salvar Projeto (Ctrl+S)"
      >
        <i class="fa fa-save"></i>
      </button>
    </div>

    <!-- Divider -->
    <div class="modern-editor-toolbar__divider"></div>

    <!-- Mode Selection -->
    <div class="modern-editor-toolbar__section">
      <div class="modern-mode-selector">
        <button 
          class="modern-mode-btn"
          :class="{ 'modern-mode-btn--active': mode === 1 }"
          @click="$emit('set-mode', 1)"
          title="Modo Blocos"
        >
          <i class="fa fa-puzzle-piece"></i>
          <span>Blocos</span>
        </button>
        <button 
          class="modern-mode-btn"
          :class="{ 'modern-mode-btn--active': mode === 2 }"
          @click="$emit('set-mode', 2)"
          title="Modo Misto"
        >
          <i class="fa fa-columns"></i>
          <span>Misto</span>
        </button>
        <button 
          class="modern-mode-btn"
          :class="{ 'modern-mode-btn--active': mode === 3 }"
          @click="$emit('set-mode', 3)"
          title="Modo Código"
        >
          <i class="fa fa-code"></i>
          <span>Código</span>
        </button>
      </div>
    </div>

    <!-- Spacer -->
    <div class="modern-editor-toolbar__spacer"></div>

    <!-- Right Section -->
    <div class="modern-editor-toolbar__section">
      <!-- Board Selection -->
      <div class="modern-board-selector">
        <label class="modern-board-selector__label">
          <i class="fa fa-microchip"></i>
          Placa:
        </label>
        <select 
          v-model="selectedBoard" 
          @change="onBoardSelect"
          class="modern-board-selector__select"
        >
          <option v-for="board in boards" :key="board.name" :value="board.name">
            {{ board.title }}
          </option>
        </select>
        <button 
          class="modern-editor-btn modern-editor-btn--icon modern-editor-btn--small" 
          @click="openBoardManager"
          title="Gerenciar Placas"
        >
          <i class="fa fa-cog"></i>
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="modern-editor-toolbar__actions">
        <button 
          class="modern-editor-btn modern-editor-btn--icon" 
          @click="openVariablePanel"
          title="Gerenciar Variáveis"
        >
          <i class="fa fa-list"></i>
        </button>
        <button 
          class="modern-editor-btn modern-editor-btn--icon" 
          @click="openConsolePanel"
          title="Console/Terminal"
        >
          <i class="fa fa-terminal"></i>
        </button>
        <button 
          class="modern-editor-btn modern-editor-btn--icon" 
          @click="toggleKids"
          :title="$global.setting.kidsMode ? 'Sair do Modo Kids' : 'Entrar no Modo Kids'"
          :class="{ 'modern-editor-btn--active': $global.setting.kidsMode }"
        >
          <i class="fa fa-child"></i>
        </button>
        <button 
          class="modern-editor-btn modern-editor-btn--icon" 
          @click="openEditorSettings"
          title="Configurações do Editor"
        >
          <i class="fa fa-sliders"></i>
        </button>
        <button 
          class="modern-editor-btn modern-editor-btn--icon" 
          @click="openCommandPalette"
          title="Paleta de Comandos (Ctrl+K)"
        >
          <i class="fa fa-search"></i>
        </button>
        <button 
          class="modern-editor-btn modern-editor-btn--icon" 
          @click="openTestPanel"
          title="Painel de Teste"
        >
          <i class="fa fa-flask"></i>
        </button>
      </div>
    </div>

    <!-- Command Palette -->
    <CommandPalette
      v-model="paletteOpen"
      :actions="paletteActions"
      @run="onPaletteRun"
    />
    
    <!-- Mode Selection Modal -->
    <ToolbarMode />
  </div>
</template>

<script>
import CommandPalette from "@/engine/components/common/CommandPalette.vue";
import ToolbarMode from "@/engine/components/editor/ToolbarMode.vue";

export default {
  name: 'ModernEditorToolbar',
  components: { CommandPalette, ToolbarMode },
  emits: [
    'new-file', 'open-file', 'save-file', 'set-mode',
    'newFile', 'openFile', 'saveFile', 'setMode'
  ],
  props: { 
    mode: { type: Number, default: 1 } 
  },
  data() {
    const defaultBoards = [
      { name: 'esp32', title: 'ESP32', platform: 'arduino-esp32' },
      { name: 'arduino-uno', title: 'Arduino Uno', platform: 'arduino-avr' },
      { name: 'arduino-nano', title: 'Arduino Nano', platform: 'arduino-avr' }
    ];
    const available = (this.$global?.board?.available) || defaultBoards;
    const boards = available.filter(b => (b.name || '').toLowerCase().includes('esp32'));
    const current = (this.$global?.board?.board_info?.name?.toLowerCase().includes('esp32')) 
      ? this.$global.board.board_info.name 
      : (boards[0]?.name || 'esp32');
    
    return { 
      boards: available, 
      selectedBoard: current, 
      paletteOpen: false, 
      zen: false,
      paletteActions: [
        { id: 'new-file', name: 'Novo Arquivo', icon: 'fa-file-o', hotkey: 'Ctrl+N' },
        { id: 'open-file', name: 'Abrir Arquivo', icon: 'fa-folder-open-o', hotkey: 'Ctrl+O' },
        { id: 'save-file', name: 'Salvar Arquivo', icon: 'fa-save', hotkey: 'Ctrl+S' },
        { id: 'mode-blocks', name: 'Modo Blocos', icon: 'fa-puzzle-piece' },
        { id: 'mode-mixed', name: 'Modo Misto', icon: 'fa-columns' },
        { id: 'mode-code', name: 'Modo Código', icon: 'fa-code' },
        { id: 'board-manager', name: 'Gerenciar Placas', icon: 'fa-microchip' },
        { id: 'settings', name: 'Configurações', icon: 'fa-sliders' }
      ]
    };
  },
  mounted() { 
    window.addEventListener('keydown', this.handleGlobalHotkeys); 
    this.bindGlobalHotkeyBus(); 
  },
  beforeUnmount() { 
    window.removeEventListener('keydown', this.handleGlobalHotkeys); 
    this.unbindGlobalHotkeyBus(); 
  },
  methods: {
    onBoardSelect() {
      const info = this.boards.find(b => b.name === this.selectedBoard) || { 
        name: this.selectedBoard, 
        title: this.selectedBoard, 
        platform: 'web', 
        dir: '' 
      };
      if (!this.$global.board) { this.$global.board = {}; }
      this.$global.board.board_info = Object.assign({ dir: '' }, info);
      this.$global.board.board = this.selectedBoard;
      this.$global.$emit('board-change', info);
    },
    openBoardManager() { 
      try { 
        this.$global.$emit && this.$global.$emit('open-board-dialog'); 
      } catch(e) {} 
    },
    toggleKids() { 
      try { 
        this.$global.setting.kidsMode = !this.$global.setting.kidsMode; 
        this.$global.$emit && this.$global.$emit('kids-mode-change', this.$global.setting.kidsMode); 
      } catch(e) {} 
    },
    openEditorSettings() {
      try {
        this.$global.ui.rightDrawerComponent = './components/editor/Setting.vue';
      } catch(e) {}
    },
    openVariablePanel() {
      try {
        // Open variables in right drawer using correct property
        this.$global.ui.rightDrawerComponent = './components/modern/ModernVariablePanel';
      } catch(e) {
        console.error('Error opening variable panel:', e);
      }
    },
    openConsolePanel() {
      try {
        // Open console in right drawer for now
        this.$global.ui.rightDrawerComponent = './components/modern/ModernConsolePanel';
      } catch(e) {
        console.error('Error opening console panel:', e);
      }
    },
    openCommandPalette() {
      this.paletteOpen = true;
    },
    openTestPanel() {
      try {
        console.log('Opening test panel...');
        console.log('$global.ui:', this.$global?.ui);
        // Open test panel in right drawer using correct property
        if (this.$global && this.$global.ui) {
          this.$global.ui.rightDrawerComponent = './components/modern/ModernTestPanel';
          console.log('Test panel opened');
        } else {
          console.error('$global.ui not available');
        }
      } catch(e) {
        console.error('Error opening test panel:', e);
      }
    },
    onPaletteRun(action) {
      switch(action.id) {
        case 'new-file': this.$emit('new-file'); break;
        case 'open-file': this.$emit('open-file'); break;
        case 'save-file': this.$emit('save-file'); break;
        case 'mode-blocks': this.$emit('set-mode', 1); break;
        case 'mode-mixed': this.$emit('set-mode', 2); break;
        case 'mode-code': this.$emit('set-mode', 3); break;
        case 'board-manager': this.openBoardManager(); break;
        case 'settings': this.openEditorSettings(); break;
      }
      this.paletteOpen = false;
    },
    bindGlobalHotkeyBus() {
      try {
        this.$global.$on && this.$global.$on('hotkey', this.handleHotkeyEvent);
        this.$global.$on && this.$global.$on('open-command-palette', this.openCommandPalette);
        this.$global.$on && this.$global.$on('toggle-zen', this.toggleZen);
      } catch(e) {}
    },
    unbindGlobalHotkeyBus() {
      try {
        this.$global.$off && this.$global.$off('hotkey', this.handleHotkeyEvent);
        this.$global.$off && this.$global.$off('open-command-palette', this.openCommandPalette);
        this.$global.$off && this.$global.$off('toggle-zen', this.toggleZen);
      } catch(e) {}
    },
    handleGlobalHotkeys(event) {
      if (event.ctrlKey || event.metaKey) {
        switch(event.key.toLowerCase()) {
          case 'n':
            event.preventDefault();
            this.$emit('new-file');
            break;
          case 'o':
            event.preventDefault();
            this.$emit('open-file');
            break;
          case 's':
            event.preventDefault();
            this.$emit('save-file');
            break;
          case 'k':
          case 'p':
            event.preventDefault();
            this.openCommandPalette();
            break;
        }
      }
    },
    handleHotkeyEvent(hotkey) {
      // Handle custom hotkey events
    },
    toggleZen() {
      this.zen = !this.zen;
      // Implement zen mode logic
    }
  }
}
</script>

<style scoped>
.modern-editor-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--kb-surface-2);
  border-bottom: 1px solid var(--kb-border);
  min-height: 48px;
}

.modern-editor-toolbar__section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modern-editor-toolbar__divider {
  width: 1px;
  height: 24px;
  background: var(--kb-border);
  margin: 0 4px;
}

.modern-editor-toolbar__spacer {
  flex: 1;
}

.modern-editor-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Buttons */
.modern-editor-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: var(--kb-radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: var(--kb-text-secondary);
  text-decoration: none;
}

.modern-editor-btn:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text-primary);
}

.modern-editor-btn--icon {
  padding: 8px;
  width: 36px;
  height: 36px;
}

.modern-editor-btn--small {
  width: 28px;
  height: 28px;
  padding: 6px;
}

.modern-editor-btn--active {
  background: var(--kb-primary);
  color: white;
}

.modern-editor-btn--active:hover {
  background: var(--kb-primary-hover);
}

/* Mode Selector */
.modern-mode-selector {
  display: flex;
  background: var(--kb-surface);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  overflow: hidden;
}

.modern-mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--kb-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  border-right: 1px solid var(--kb-border);
}

.modern-mode-btn:last-child {
  border-right: none;
}

.modern-mode-btn:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text-primary);
}

.modern-mode-btn--active {
  background: var(--kb-primary);
  color: white;
}

.modern-mode-btn--active:hover {
  background: var(--kb-primary-hover);
}

/* Board Selector */
.modern-board-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--kb-surface);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  padding: 6px 8px;
}

.modern-board-selector__label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--kb-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.modern-board-selector__select {
  background: transparent;
  border: none;
  color: var(--kb-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  min-width: 100px;
}

.modern-board-selector__select option {
  background: var(--kb-surface-2);
  color: var(--kb-text-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .modern-editor-toolbar {
    padding: 6px 12px;
    gap: 8px;
  }
  
  .modern-mode-btn span {
    display: none;
  }
  
  .modern-board-selector__label {
    display: none;
  }
  
  .modern-board-selector__select {
    min-width: 80px;
  }
}
</style>

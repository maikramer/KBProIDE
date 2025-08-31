<template>
  <div class="modern-toolbar">
    <!-- Brand Section -->
    <div class="modern-toolbar__brand">
      <button 
        class="modern-btn modern-btn--icon" 
        @click="$global.$emit('app-drawer-toggle')"
        title="Menu"
      >
        <i class="fa fa-bars"></i>
      </button>
      <img src="/static/logo/KBIDE.png" alt="KBIDE" />
      <span class="modern-toolbar__title">KBIDE</span>
    </div>

    <!-- File Operations -->
    <div class="modern-toolbar__section">
      <button 
        class="modern-btn modern-btn--icon" 
        @click="$global.$emit('file-new')"
        title="Novo Projeto (Ctrl+N)"
      >
        <i class="fa fa-file-o"></i>
      </button>
      <button 
        class="modern-btn modern-btn--icon" 
        @click="$global.$emit('file-open')"
        title="Abrir Projeto (Ctrl+O)"
      >
        <i class="fa fa-folder-open-o"></i>
      </button>
      <button 
        class="modern-btn modern-btn--icon" 
        @click="$global.$emit('file-save')"
        title="Salvar Projeto (Ctrl+S)"
      >
        <i class="fa fa-save"></i>
      </button>
    </div>

    <div class="modern-toolbar__divider"></div>

    <!-- Editor Mode Selection -->
    <div class="modern-toolbar__section">
      <button 
        class="modern-btn modern-btn--icon" 
        :class="{ 'modern-btn--active': $global.editor.mode === 1 }"
        @click="$global.$emit('editor-mode-change', 1)"
        title="Modo Blocos"
      >
        <i class="fa fa-puzzle-piece"></i>
      </button>
      <button 
        class="modern-btn modern-btn--icon" 
        :class="{ 'modern-btn--active': $global.editor.mode === 2 }"
        @click="$global.$emit('editor-mode-change', 2)"
        title="Modo Misto"
      >
        <i class="fa fa-columns"></i>
      </button>
      <button 
        class="modern-btn modern-btn--icon" 
        :class="{ 'modern-btn--active': $global.editor.mode === 3 }"
        @click="$global.$emit('editor-mode-change', 3)"
        title="Modo Código"
      >
        <i class="fa fa-code"></i>
      </button>
    </div>

    <div class="modern-toolbar__divider"></div>

    <!-- Board Selection -->
    <div class="modern-toolbar__section">
      <select 
        v-model="selectedBoard" 
        @change="onBoardChange"
        class="modern-select"
        title="Selecionar Placa"
      >
        <option v-for="board in boards" :key="board.name" :value="board.name">
          {{ board.title }}
        </option>
      </select>
      <button 
        class="modern-btn modern-btn--icon" 
        @click="openBoardManager"
        title="Gerenciador de Placas"
      >
        <i class="fa fa-microchip"></i>
      </button>
    </div>

    <!-- Spacer -->
    <div style="flex: 1"></div>

    <!-- Right Actions -->
    <div class="modern-toolbar__section">
      <button 
        class="modern-btn modern-btn--icon" 
        @click="openBoardManager"
        title="Gerenciador de Placas"
      >
        <i class="fa fa-microchip"></i>
      </button>
      <button 
        class="modern-btn modern-btn--icon" 
        @click="openPlatformManager"
        title="Gerenciador de Plataformas"
      >
        <i class="fa fa-cogs"></i>
      </button>
      <button 
        class="modern-btn modern-btn--icon" 
        @click="openPluginManager"
        title="Gerenciador de Plugins"
      >
        <i class="fa fa-puzzle-piece"></i>
      </button>
      <button 
        class="modern-btn modern-btn--icon" 
        @click="toggleTheme"
        :title="isDark ? 'Tema Claro' : 'Tema Escuro'"
      >
        <i class="fa" :class="isDark ? 'fa-sun-o' : 'fa-moon-o'"></i>
      </button>
      <button 
        class="modern-btn modern-btn--icon" 
        @click="openSettings"
        title="Configurações"
      >
        <i class="fa fa-cog"></i>
      </button>
      <button 
        class="modern-btn modern-btn--icon" 
        @click="toggleFullscreen"
        title="Tela Cheia"
      >
        <i class="fa fa-expand"></i>
      </button>
    </div>

    <!-- Modern Modals -->
    <ModernBoardManager v-model="showBoardManager" />
    <ModernPlatformManager v-model="showPlatformManager" />
    <ModernPluginManager v-model="showPluginManager" />
    <ModernSettings v-model="showSettings" />
  </div>
</template>

<script>
import ModernBoardManager from './ModernBoardManager.vue';
import ModernPlatformManager from './ModernPlatformManager.vue';
import ModernPluginManager from './ModernPluginManager.vue';
import ModernSettings from './ModernSettings.vue';

export default {
  name: 'ModernToolbar',
  components: {
    ModernBoardManager,
    ModernPlatformManager,
    ModernPluginManager,
    ModernSettings
  },
  data() {
    return {
      selectedBoard: 'esp32',
      showBoardManager: false,
      showPlatformManager: false,
      showPluginManager: false,
      showSettings: false,
      boards: [
        { name: 'esp32', title: 'ESP32', platform: 'arduino-esp32' },
        { name: 'arduino-uno', title: 'Arduino Uno', platform: 'arduino-avr' },
        { name: 'arduino-nano', title: 'Arduino Nano', platform: 'arduino-avr' }
      ],
      isDark: true
    }
  },
  methods: {
    onBoardChange() {
      const board = this.boards.find(b => b.name === this.selectedBoard);
      if (board && this.$global.board) {
        this.$global.board.board_info = board;
        this.$global.$emit('board-change', board);
      }
    },
    openBoardManager() {
      this.showBoardManager = true;
    },
    openPlatformManager() {
      this.showPlatformManager = true;
    },
    openPluginManager() {
      this.showPluginManager = true;
    },
    openSettings() {
      this.showSettings = true;
    },
    toggleTheme() {
      this.isDark = !this.isDark;
      // Implement theme switching logic here
      document.documentElement.classList.toggle('light-theme', !this.isDark);
    },
    toggleFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    }
  },
  mounted() {
    // Initialize board selection
    if (this.$global.board && this.$global.board.board_info) {
      this.selectedBoard = this.$global.board.board_info.name || 'esp32';
    }
  }
}
</script>

<style scoped>
.modern-select {
  background: var(--kb-surface-3);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  color: var(--kb-text-primary);
  padding: 8px 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
}

.modern-select:hover {
  border-color: var(--kb-border-light);
}

.modern-select:focus {
  outline: none;
  border-color: var(--kb-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.modern-select option {
  background: var(--kb-surface-2);
  color: var(--kb-text-primary);
}
</style>

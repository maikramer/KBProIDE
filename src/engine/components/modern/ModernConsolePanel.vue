<template>
  <div class="modern-console-panel">
    <!-- Header with Controls -->
    <div class="console-panel__header">
      <div class="console-panel__title">
        <i class="fa fa-terminal"></i>
        <span>Console</span>
      </div>
      <div class="console-panel__controls">
        <button 
          class="console-btn"
          @click="clearConsole"
          title="Limpar Console"
        >
          <i class="fa fa-eraser"></i>
        </button>
        <button 
          class="console-btn"
          @click="toggleAutoScroll"
          :class="{ 'console-btn--active': autoScroll }"
          title="Auto Scroll"
        >
          <i class="fa fa-arrow-down"></i>
        </button>
        <button 
          class="console-btn"
          @click="exportLog"
          title="Exportar Log"
        >
          <i class="fa fa-download"></i>
        </button>
      </div>
    </div>

    <!-- Console Content -->
    <div class="console-panel__content" ref="consoleContent">
      <div v-if="logs.length === 0" class="console-empty">
        <i class="fa fa-terminal"></i>
        <p>Console vazio. As mensagens aparecerão aqui.</p>
      </div>
      
      <div v-else class="console-logs">
        <div 
          v-for="(log, index) in logs" 
          :key="index"
          class="console-log"
          :class="`console-log--${log.level}`"
        >
          <div class="console-log__timestamp">
            {{ formatTime(log.timestamp) }}
          </div>
          <div class="console-log__level">
            <i class="fa" :class="getLevelIcon(log.level)"></i>
          </div>
          <div class="console-log__message">
            {{ log.message }}
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="console-panel__input">
      <div class="console-input">
        <i class="fa fa-chevron-right"></i>
        <input 
          v-model="inputCommand"
          type="text" 
          placeholder="Digite um comando..."
          class="console-input__field"
          @keyup.enter="executeCommand"
        />
        <button 
          class="console-input__send"
          @click="executeCommand"
          :disabled="!inputCommand.trim()"
        >
          <i class="fa fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModernConsolePanel',
  data() {
    return {
      logs: [
        {
          level: 'info',
          message: 'Sistema iniciado com sucesso',
          timestamp: new Date()
        },
        {
          level: 'success',
          message: 'Blockly carregado',
          timestamp: new Date()
        }
      ],
      inputCommand: '',
      autoScroll: true
    }
  },
  methods: {
    addLog(level, message) {
      const log = {
        level,
        message,
        timestamp: new Date()
      };
      
      this.logs.push(log);
      
      // Limit log history
      if (this.logs.length > 1000) {
        this.logs = this.logs.slice(-1000);
      }
      
      // Auto scroll to bottom
      if (this.autoScroll) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    
    clearConsole() {
      this.logs = [];
    },
    
    toggleAutoScroll() {
      this.autoScroll = !this.autoScroll;
    },
    
    exportLog() {
      const logText = this.logs.map(log => 
        `[${this.formatTime(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}`
      ).join('\n');
      
      const blob = new Blob([logText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `console-log-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    },
    
    executeCommand() {
      if (!this.inputCommand.trim()) return;
      
      const command = this.inputCommand.trim();
      this.addLog('command', `> ${command}`);
      
      // Process command
      this.processCommand(command);
      
      this.inputCommand = '';
    },
    
    processCommand(command) {
      // Simple command processor
      switch (command.toLowerCase()) {
        case 'clear':
          this.clearConsole();
          break;
        case 'help':
          this.addLog('info', 'Comandos disponíveis: clear, help, status, version');
          break;
        case 'status':
          this.addLog('info', `Modo: ${this.$global?.editor?.mode || 'N/A'}, Placa: ${this.$global?.board?.board || 'N/A'}`);
          break;
        case 'version':
          this.addLog('info', 'KBIDE v2.0.0');
          break;
        default:
          this.addLog('error', `Comando não reconhecido: ${command}. Digite 'help' para ver comandos disponíveis.`);
      }
    },
    
    scrollToBottom() {
      if (this.$refs.consoleContent) {
        this.$refs.consoleContent.scrollTop = this.$refs.consoleContent.scrollHeight;
      }
    },
    
    formatTime(timestamp) {
      return timestamp.toLocaleTimeString('pt-BR', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    
    getLevelIcon(level) {
      switch (level) {
        case 'error': return 'fa-times-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'success': return 'fa-check-circle';
        case 'command': return 'fa-chevron-right';
        default: return 'fa-info-circle';
      }
    }
  },
  
  mounted() {
    // Listen for global console events
    if (this.$global && this.$global.$on) {
      this.$global.$on('console-log', (level, message) => {
        this.addLog(level, message);
      });
    }
  },
  
  beforeUnmount() {
    if (this.$global && this.$global.$off) {
      this.$global.$off('console-log');
    }
  }
}
</script>

<style scoped>
.modern-console-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--kb-surface);
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
}

.console-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--kb-surface-3);
  border-bottom: 1px solid var(--kb-border);
  flex-shrink: 0;
}

.console-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--kb-text-primary);
  font-size: 0.875rem;
}

.console-panel__title i {
  color: var(--kb-primary);
}

.console-panel__controls {
  display: flex;
  gap: 4px;
}

.console-btn {
  padding: 4px 6px;
  background: none;
  border: none;
  color: var(--kb-text-muted);
  cursor: pointer;
  border-radius: var(--kb-radius-sm);
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.console-btn:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text-primary);
}

.console-btn--active {
  background: var(--kb-primary);
  color: white;
}

.console-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background: #0a0e1a;
}

.console-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--kb-text-muted);
}

.console-empty i {
  font-size: 24px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.console-empty p {
  margin: 0;
  font-size: 0.875rem;
}

.console-logs {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.console-log {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 8px;
  border-radius: var(--kb-radius-sm);
  font-size: 0.75rem;
  line-height: 1.4;
}

.console-log--info {
  color: #94a3b8;
}

.console-log--success {
  color: #22c55e;
}

.console-log--warning {
  color: #f59e0b;
}

.console-log--error {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.console-log--command {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.console-log__timestamp {
  color: var(--kb-text-muted);
  font-size: 0.7rem;
  flex-shrink: 0;
  opacity: 0.7;
}

.console-log__level {
  flex-shrink: 0;
  width: 16px;
}

.console-log__message {
  flex: 1;
  word-break: break-word;
}

.console-panel__input {
  background: var(--kb-surface-3);
  border-top: 1px solid var(--kb-border);
  padding: 8px 12px;
  flex-shrink: 0;
}

.console-input {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--kb-surface);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  padding: 6px 8px;
}

.console-input i {
  color: var(--kb-primary);
  font-size: 0.75rem;
}

.console-input__field {
  flex: 1;
  background: none;
  border: none;
  color: var(--kb-text-primary);
  font-size: 0.875rem;
  outline: none;
  font-family: inherit;
}

.console-input__field::placeholder {
  color: var(--kb-text-muted);
}

.console-input__send {
  padding: 4px 6px;
  background: var(--kb-primary);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: var(--kb-radius-sm);
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.console-input__send:hover {
  background: var(--kb-primary-hover);
}

.console-input__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar styling */
.console-panel__content::-webkit-scrollbar {
  width: 6px;
}

.console-panel__content::-webkit-scrollbar-track {
  background: var(--kb-surface-2);
}

.console-panel__content::-webkit-scrollbar-thumb {
  background: var(--kb-border);
  border-radius: 3px;
}

.console-panel__content::-webkit-scrollbar-thumb:hover {
  background: var(--kb-border-light);
}
</style>

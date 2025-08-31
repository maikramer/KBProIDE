<template>
  <div class="modern-debug-panel">
    <div class="debug-header">
      <h3>Debug Panel</h3>
      <p>Este é um painel de teste para verificar se os componentes modernos funcionam.</p>
    </div>
    
    <div class="debug-content">
      <div class="debug-section">
        <h4>Estado Global</h4>
        <ul>
          <li>Modo Editor: {{ $global?.editor?.mode || 'N/A' }}</li>
          <li>Placa: {{ $global?.board?.board || 'N/A' }}</li>
          <li>Abas Direitas: {{ ($global?.ui?.rightTab || []).length }}</li>
          <li>Abas Inferiores: {{ ($global?.ui?.bottomTab || []).length }}</li>
        </ul>
      </div>
      
      <div class="debug-section">
        <h4>Ações de Teste</h4>
        <button @click="addTestBottomTab" class="debug-btn">
          Adicionar Aba Inferior
        </button>
        <button @click="addTestRightTab" class="debug-btn">
          Adicionar Aba Lateral
        </button>
        <button @click="clearTabs" class="debug-btn">
          Limpar Todas as Abas
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModernDebugPanel',
  methods: {
    addTestBottomTab() {
      try {
        if (this.$global?.ui?.addBottomTab) {
          this.$global.ui.addBottomTab('test-bottom', 'Teste Inferior', './components/modern/ModernDebugPanel');
        }
      } catch(e) {
        console.error('Error adding bottom tab:', e);
      }
    },
    
    addTestRightTab() {
      try {
        if (this.$global?.ui?.addRightTab) {
          this.$global.ui.addRightTab('test-right', 'Teste Lateral', './components/modern/ModernDebugPanel');
        }
      } catch(e) {
        console.error('Error adding right tab:', e);
      }
    },
    
    clearTabs() {
      try {
        if (this.$global?.ui) {
          this.$global.ui.rightTab = [];
          this.$global.ui.bottomTab = [];
        }
      } catch(e) {
        console.error('Error clearing tabs:', e);
      }
    }
  }
}
</script>

<style scoped>
.modern-debug-panel {
  padding: 16px;
  background: var(--kb-surface);
  color: var(--kb-text-primary);
  font-family: 'Inter', sans-serif;
}

.debug-header {
  margin-bottom: 20px;
}

.debug-header h3 {
  color: var(--kb-primary);
  margin: 0 0 8px 0;
}

.debug-header p {
  color: var(--kb-text-secondary);
  margin: 0;
  font-size: 0.875rem;
}

.debug-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.debug-section {
  background: var(--kb-surface-2);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  padding: 12px;
}

.debug-section h4 {
  color: var(--kb-text-primary);
  margin: 0 0 8px 0;
  font-size: 0.875rem;
}

.debug-section ul {
  margin: 0;
  padding-left: 16px;
  color: var(--kb-text-secondary);
  font-size: 0.75rem;
}

.debug-section li {
  margin-bottom: 4px;
}

.debug-btn {
  padding: 6px 12px;
  margin: 4px 4px 4px 0;
  background: var(--kb-primary);
  color: white;
  border: none;
  border-radius: var(--kb-radius);
  cursor: pointer;
  font-size: 0.75rem;
  transition: background 0.2s ease;
}

.debug-btn:hover {
  background: var(--kb-primary-hover);
}
</style>

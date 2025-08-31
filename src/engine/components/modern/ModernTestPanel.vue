<template>
  <div class="modern-test-panel">
    <div class="test-header">
      <h3>🧪 Painel de Teste</h3>
      <p>Este painel confirma que o sistema moderno funciona!</p>
    </div>
    
    <div class="test-content">
      <div class="test-info">
        <h4>✅ Componente Carregado</h4>
        <p>Se você está vendo isso, o sistema AsyncComponent está funcionando.</p>
      </div>
      
      <div class="test-actions">
        <button @click="testAlert" class="test-btn">
          Testar Alert
        </button>
        <button @click="testConsole" class="test-btn">
          Testar Console
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModernTestPanel',
  methods: {
    testAlert() {
      alert('✅ Painel de teste funcionando!');
    },
    testConsole() {
      console.log('✅ Console log do painel de teste');
    }
  }
}
</script>

<style scoped>
.modern-test-panel {
  padding: 20px;
  background: var(--kb-surface);
  color: var(--kb-text-primary);
  height: 100%;
}

.test-header h3 {
  color: var(--kb-primary);
  margin: 0 0 8px 0;
}

.test-header p {
  color: var(--kb-text-secondary);
  margin: 0 0 16px 0;
}

.test-info {
  background: var(--kb-surface-2);
  padding: 12px;
  border-radius: var(--kb-radius);
  margin-bottom: 16px;
}

.test-info h4 {
  color: var(--kb-success);
  margin: 0 0 8px 0;
}

.test-actions {
  display: flex;
  gap: 8px;
}

.test-btn {
  padding: 8px 16px;
  background: var(--kb-primary);
  color: white;
  border: none;
  border-radius: var(--kb-radius);
  cursor: pointer;
  transition: background 0.2s ease;
}

.test-btn:hover {
  background: var(--kb-primary-hover);
}
</style>

<template>
  <div class="modern-variable-panel">
    <!-- Header with Actions -->
    <div class="variable-panel__header">
      <div class="variable-panel__title">
        <i class="fa fa-list"></i>
        <span>Variáveis</span>
      </div>
      <div class="variable-panel__actions">
        <button 
          class="modern-btn modern-btn--small modern-btn--primary"
          @click="showCreateDialog = true"
          title="Nova Variável"
        >
          <i class="fa fa-plus"></i>
          Nova
        </button>
        <button 
          class="modern-btn modern-btn--small"
          @click="refreshVariables"
          title="Atualizar"
        >
          <i class="fa fa-refresh"></i>
        </button>
      </div>
    </div>

    <!-- Variables List -->
    <div class="variable-panel__content">
      <div v-if="variables.length === 0" class="empty-state">
        <i class="fa fa-list"></i>
        <h4>Nenhuma variável criada</h4>
        <p>Clique em "Nova" para criar sua primeira variável</p>
      </div>
      
      <div v-else class="variables-list">
        <div 
          v-for="variable in variables" 
          :key="variable.id"
          class="variable-item"
          @click="selectVariable(variable)"
          :class="{ 'variable-item--selected': selectedVariable?.id === variable.id }"
        >
          <div class="variable-item__icon">
            <i class="fa" :class="getVariableIcon(variable.type)"></i>
          </div>
          <div class="variable-item__info">
            <div class="variable-item__name">{{ variable.name }}</div>
            <div class="variable-item__type">{{ getVariableTypeLabel(variable.type) }}</div>
          </div>
          <div class="variable-item__value">
            <span class="variable-value">{{ formatValue(variable.value) }}</span>
          </div>
          <div class="variable-item__actions">
            <button 
              class="variable-action"
              @click.stop="editVariable(variable)"
              title="Editar"
            >
              <i class="fa fa-edit"></i>
            </button>
            <button 
              class="variable-action variable-action--danger"
              @click.stop="deleteVariable(variable)"
              title="Excluir"
            >
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Variable Dialog -->
    <ModernModal
      v-model="showCreateDialog"
      :title="editingVariable ? 'Editar Variável' : 'Nova Variável'"
      icon="fa-list"
      size="medium"
    >
      <div class="variable-form">
        <div class="form-group">
          <label class="form-label">Nome da Variável</label>
          <input 
            v-model="variableForm.name"
            type="text" 
            class="form-input"
            placeholder="Digite o nome da variável"
            @keyup.enter="saveVariable"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select v-model="variableForm.type" class="form-select">
            <option value="number">Número</option>
            <option value="text">Texto</option>
            <option value="boolean">Verdadeiro/Falso</option>
            <option value="list">Lista</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Valor Inicial</label>
          <input 
            v-if="variableForm.type === 'number'"
            v-model.number="variableForm.value"
            type="number" 
            class="form-input"
            placeholder="0"
          />
          <input 
            v-else-if="variableForm.type === 'text'"
            v-model="variableForm.value"
            type="text" 
            class="form-input"
            placeholder="Digite o texto"
          />
          <select 
            v-else-if="variableForm.type === 'boolean'"
            v-model="variableForm.value" 
            class="form-select"
          >
            <option :value="true">Verdadeiro</option>
            <option :value="false">Falso</option>
          </select>
          <textarea 
            v-else
            v-model="variableForm.value"
            class="form-textarea"
            placeholder="Digite os itens da lista, um por linha"
            rows="3"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <button class="modern-btn" @click="cancelEdit">
          Cancelar
        </button>
        <button 
          class="modern-btn modern-btn--primary" 
          @click="saveVariable"
          :disabled="!variableForm.name.trim()"
        >
          {{ editingVariable ? 'Atualizar' : 'Criar' }}
        </button>
      </template>
    </ModernModal>
  </div>
</template>

<script>
import ModernModal from './ModernModal.vue';

export default {
  name: 'ModernVariablePanel',
  components: { ModernModal },
  data() {
    return {
      variables: [
        // Example variables - these would come from Blockly workspace
        {
          id: 'var1',
          name: 'contador',
          type: 'number',
          value: 0
        },
        {
          id: 'var2',
          name: 'mensagem',
          type: 'text',
          value: 'Olá mundo!'
        }
      ],
      selectedVariable: null,
      showCreateDialog: false,
      editingVariable: null,
      variableForm: {
        name: '',
        type: 'number',
        value: ''
      }
    }
  },
  methods: {
    selectVariable(variable) {
      this.selectedVariable = variable;
    },
    
    editVariable(variable) {
      this.editingVariable = variable;
      this.variableForm = {
        name: variable.name,
        type: variable.type,
        value: variable.value
      };
      this.showCreateDialog = true;
    },
    
    deleteVariable(variable) {
      if (confirm(`Tem certeza que deseja excluir a variável "${variable.name}"?`)) {
        const index = this.variables.findIndex(v => v.id === variable.id);
        if (index !== -1) {
          this.variables.splice(index, 1);
        }
        
        // Remove from Blockly workspace if it exists
        this.removeFromBlockly(variable);
      }
    },
    
    saveVariable() {
      if (!this.variableForm.name.trim()) return;
      
      if (this.editingVariable) {
        // Update existing variable
        const index = this.variables.findIndex(v => v.id === this.editingVariable.id);
        if (index !== -1) {
          this.variables[index] = {
            ...this.editingVariable,
            name: this.variableForm.name,
            type: this.variableForm.type,
            value: this.variableForm.value
          };
        }
      } else {
        // Create new variable
        const newVariable = {
          id: 'var_' + Date.now(),
          name: this.variableForm.name,
          type: this.variableForm.type,
          value: this.variableForm.value
        };
        this.variables.push(newVariable);
      }
      
      // Add to Blockly workspace
      this.addToBlockly(this.variableForm);
      
      this.cancelEdit();
    },
    
    cancelEdit() {
      this.showCreateDialog = false;
      this.editingVariable = null;
      this.variableForm = {
        name: '',
        type: 'number',
        value: ''
      };
    },
    
    refreshVariables() {
      // Sync with Blockly workspace variables
      this.syncWithBlockly();
    },
    
    addToBlockly(variable) {
      try {
        if (window.Blockly && window.Blockly.getMainWorkspace) {
          const workspace = window.Blockly.getMainWorkspace();
          if (workspace) {
            workspace.createVariable(variable.name, variable.type);
          }
        }
      } catch (e) {
        console.warn('Error adding variable to Blockly:', e);
      }
    },
    
    removeFromBlockly(variable) {
      try {
        if (window.Blockly && window.Blockly.getMainWorkspace) {
          const workspace = window.Blockly.getMainWorkspace();
          if (workspace) {
            const blocklyVar = workspace.getVariable(variable.name, variable.type);
            if (blocklyVar) {
              workspace.deleteVariableById(blocklyVar.getId());
            }
          }
        }
      } catch (e) {
        console.warn('Error removing variable from Blockly:', e);
      }
    },
    
    syncWithBlockly() {
      try {
        if (window.Blockly && window.Blockly.getMainWorkspace) {
          const workspace = window.Blockly.getMainWorkspace();
          if (workspace) {
            const blocklyVars = workspace.getAllVariables();
            this.variables = blocklyVars.map(v => ({
              id: v.getId(),
              name: v.name,
              type: v.type || 'number',
              value: this.getVariableValue(v)
            }));
          }
        }
      } catch (e) {
        console.warn('Error syncing with Blockly:', e);
      }
    },
    
    getVariableValue(blocklyVariable) {
      // This would need to be implemented based on how values are stored
      return 0; // Default value
    },
    
    getVariableIcon(type) {
      switch (type) {
        case 'number': return 'fa-hashtag';
        case 'text': return 'fa-font';
        case 'boolean': return 'fa-toggle-on';
        case 'list': return 'fa-list-ul';
        default: return 'fa-cube';
      }
    },
    
    getVariableTypeLabel(type) {
      switch (type) {
        case 'number': return 'Número';
        case 'text': return 'Texto';
        case 'boolean': return 'Lógico';
        case 'list': return 'Lista';
        default: return 'Desconhecido';
      }
    },
    
    formatValue(value) {
      if (typeof value === 'boolean') {
        return value ? 'Verdadeiro' : 'Falso';
      }
      if (typeof value === 'string' && value.length > 20) {
        return value.substring(0, 20) + '...';
      }
      return String(value);
    }
  },
  
  mounted() {
    // Sync variables when component mounts
    this.refreshVariables();
  }
}
</script>

<style scoped>
.modern-variable-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--kb-surface);
}

.variable-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--kb-surface-3);
  border-bottom: 1px solid var(--kb-border);
  flex-shrink: 0;
}

.variable-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--kb-text-primary);
}

.variable-panel__title i {
  color: var(--kb-primary);
}

.variable-panel__actions {
  display: flex;
  gap: 8px;
}

.variable-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--kb-text-muted);
}

.empty-state i {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--kb-text-secondary);
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

.variables-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.variable-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--kb-surface-2);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.variable-item:hover {
  border-color: var(--kb-border-light);
  box-shadow: var(--kb-shadow);
}

.variable-item--selected {
  border-color: var(--kb-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.variable-item__icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--kb-surface-3);
  border-radius: var(--kb-radius-sm);
  flex-shrink: 0;
}

.variable-item__icon i {
  font-size: 12px;
  color: var(--kb-primary);
}

.variable-item__info {
  flex: 1;
  min-width: 0;
}

.variable-item__name {
  font-weight: 600;
  color: var(--kb-text-primary);
  font-size: 0.875rem;
  margin-bottom: 2px;
}

.variable-item__type {
  font-size: 0.75rem;
  color: var(--kb-text-muted);
}

.variable-item__value {
  margin-right: 8px;
}

.variable-value {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--kb-text-secondary);
  background: var(--kb-surface);
  padding: 2px 6px;
  border-radius: var(--kb-radius-sm);
}

.variable-item__actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.variable-item:hover .variable-item__actions {
  opacity: 1;
}

.variable-action {
  padding: 4px;
  background: none;
  border: none;
  color: var(--kb-text-muted);
  cursor: pointer;
  border-radius: var(--kb-radius-sm);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.variable-action:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text-primary);
}

.variable-action--danger:hover {
  background: var(--kb-error);
  color: white;
}

/* Form Styles */
.variable-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--kb-text-primary);
}

.form-input,
.form-select,
.form-textarea {
  padding: 8px 12px;
  background: var(--kb-surface);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  color: var(--kb-text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--kb-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
  font-family: monospace;
}

.modern-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: var(--kb-radius);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--kb-surface-3);
  color: var(--kb-text-secondary);
}

.modern-btn:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text-primary);
}

.modern-btn--primary {
  background: var(--kb-primary);
  color: white;
}

.modern-btn--primary:hover {
  background: var(--kb-primary-hover);
}

.modern-btn--small {
  padding: 4px 8px;
  font-size: 0.7rem;
}

.modern-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

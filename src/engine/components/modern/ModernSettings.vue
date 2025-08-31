<template>
  <ModernModal
    v-model="isOpen"
    title="Configurações"
    icon="fa-cog"
    size="large"
    @close="$emit('close')"
  >
    <!-- Settings Navigation -->
    <div class="settings-layout">
      <div class="settings-sidebar">
        <nav class="settings-nav">
          <button 
            v-for="section in sections"
            :key="section.id"
            class="settings-nav__item"
            :class="{ 'settings-nav__item--active': activeSection === section.id }"
            @click="activeSection = section.id"
          >
            <i class="fa" :class="section.icon"></i>
            <span>{{ section.name }}</span>
          </button>
        </nav>
      </div>
      
      <div class="settings-content">
        <!-- General Settings -->
        <div v-if="activeSection === 'general'" class="settings-section">
          <h3 class="settings-section__title">Configurações Gerais</h3>
          
          <div class="settings-group">
            <label class="settings-label">Idioma</label>
            <select v-model="settings.language" class="modern-select">
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          
          <div class="settings-group">
            <label class="settings-label">Tema</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" v-model="settings.theme" value="dark" />
                <span class="radio-custom"></span>
                <span>Escuro</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="settings.theme" value="light" />
                <span class="radio-custom"></span>
                <span>Claro</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="settings.theme" value="auto" />
                <span class="radio-custom"></span>
                <span>Automático</span>
              </label>
            </div>
          </div>
          
          <div class="settings-group">
            <label class="settings-checkbox">
              <input type="checkbox" v-model="settings.autoSave" />
              <span class="checkbox-custom"></span>
              <span>Salvamento automático</span>
            </label>
            <p class="settings-description">Salva automaticamente o projeto a cada 30 segundos</p>
          </div>
          
          <div class="settings-group">
            <label class="settings-checkbox">
              <input type="checkbox" v-model="settings.showWelcome" />
              <span class="checkbox-custom"></span>
              <span>Mostrar tela de boas-vindas</span>
            </label>
          </div>
        </div>

        <!-- Editor Settings -->
        <div v-if="activeSection === 'editor'" class="settings-section">
          <h3 class="settings-section__title">Editor</h3>
          
          <div class="settings-group">
            <label class="settings-label">Tamanho da fonte</label>
            <div class="input-with-unit">
              <input 
                type="number" 
                v-model.number="settings.editor.fontSize" 
                min="10" 
                max="24" 
                class="modern-input"
              />
              <span class="input-unit">px</span>
            </div>
          </div>
          
          <div class="settings-group">
            <label class="settings-label">Família da fonte</label>
            <select v-model="settings.editor.fontFamily" class="modern-select">
              <option value="Monaco">Monaco</option>
              <option value="Consolas">Consolas</option>
              <option value="Source Code Pro">Source Code Pro</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
            </select>
          </div>
          
          <div class="settings-group">
            <label class="settings-checkbox">
              <input type="checkbox" v-model="settings.editor.wordWrap" />
              <span class="checkbox-custom"></span>
              <span>Quebra de linha automática</span>
            </label>
          </div>
          
          <div class="settings-group">
            <label class="settings-checkbox">
              <input type="checkbox" v-model="settings.editor.lineNumbers" />
              <span class="checkbox-custom"></span>
              <span>Mostrar números das linhas</span>
            </label>
          </div>
          
          <div class="settings-group">
            <label class="settings-checkbox">
              <input type="checkbox" v-model="settings.editor.minimap" />
              <span class="checkbox-custom"></span>
              <span>Mostrar minimap</span>
            </label>
          </div>
          
          <div class="settings-group">
            <label class="settings-label">Indentação</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" v-model="settings.editor.indentType" value="spaces" />
                <span class="radio-custom"></span>
                <span>Espaços</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="settings.editor.indentType" value="tabs" />
                <span class="radio-custom"></span>
                <span>Tabs</span>
              </label>
            </div>
          </div>
          
          <div class="settings-group">
            <label class="settings-label">Tamanho da indentação</label>
            <select v-model.number="settings.editor.indentSize" class="modern-select">
              <option :value="2">2 espaços</option>
              <option :value="4">4 espaços</option>
              <option :value="8">8 espaços</option>
            </select>
          </div>
        </div>

        <!-- Blockly Settings -->
        <div v-if="activeSection === 'blockly'" class="settings-section">
          <h3 class="settings-section__title">Blockly</h3>
          
          <div class="settings-group">
            <label class="settings-label">Tema dos blocos</label>
            <select v-model="settings.blockly.theme" class="modern-select">
              <option value="classic">Clássico</option>
              <option value="modern">Moderno</option>
              <option value="high-contrast">Alto Contraste</option>
            </select>
          </div>
          
          <div class="settings-group">
            <label class="settings-checkbox">
              <input type="checkbox" v-model="settings.blockly.sounds" />
              <span class="checkbox-custom"></span>
              <span>Sons de interação</span>
            </label>
          </div>
          
          <div class="settings-group">
            <label class="settings-checkbox">
              <input type="checkbox" v-model="settings.blockly.grid" />
              <span class="checkbox-custom"></span>
              <span>Mostrar grade</span>
            </label>
          </div>
          
          <div class="settings-group">
            <label class="settings-checkbox">
              <input type="checkbox" v-model="settings.blockly.scrollbars" />
              <span class="checkbox-custom"></span>
              <span>Barras de rolagem</span>
            </label>
          </div>
          
          <div class="settings-group">
            <label class="settings-label">Zoom inicial</label>
            <div class="input-with-unit">
              <input 
                type="number" 
                v-model.number="settings.blockly.zoom" 
                min="0.5" 
                max="2" 
                step="0.1"
                class="modern-input"
              />
              <span class="input-unit">x</span>
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div v-if="activeSection === 'advanced'" class="settings-section">
          <h3 class="settings-section__title">Avançado</h3>
          
          <div class="settings-group">
            <label class="settings-checkbox">
              <input type="checkbox" v-model="settings.advanced.developerMode" />
              <span class="checkbox-custom"></span>
              <span>Modo desenvolvedor</span>
            </label>
            <p class="settings-description">Habilita funcionalidades avançadas e logs detalhados</p>
          </div>
          
          <div class="settings-group">
            <label class="settings-checkbox">
              <input type="checkbox" v-model="settings.advanced.experimentalFeatures" />
              <span class="checkbox-custom"></span>
              <span>Recursos experimentais</span>
            </label>
            <p class="settings-description">Habilita recursos em desenvolvimento (pode ser instável)</p>
          </div>
          
          <div class="settings-group">
            <label class="settings-label">Nível de log</label>
            <select v-model="settings.advanced.logLevel" class="modern-select">
              <option value="error">Apenas erros</option>
              <option value="warn">Avisos e erros</option>
              <option value="info">Informações</option>
              <option value="debug">Debug completo</option>
            </select>
          </div>
          
          <div class="settings-group">
            <label class="settings-label">Cache do navegador</label>
            <div class="button-group">
              <button class="modern-btn modern-btn--outline" @click="clearCache">
                <i class="fa fa-trash"></i>
                Limpar Cache
              </button>
              <button class="modern-btn modern-btn--outline" @click="resetSettings">
                <i class="fa fa-undo"></i>
                Resetar Configurações
              </button>
            </div>
          </div>
        </div>

        <!-- About Section -->
        <div v-if="activeSection === 'about'" class="settings-section">
          <h3 class="settings-section__title">Sobre</h3>
          
          <div class="about-info">
            <div class="about-logo">
              <img src="/static/logo/KBIDE.png" alt="KBIDE" />
            </div>
            <div class="about-details">
              <h4>KBIDE</h4>
              <p>Versão 2.0.0</p>
              <p>IDE visual para desenvolvimento com microcontroladores</p>
              
              <div class="about-links">
                <a href="#" class="about-link">
                  <i class="fa fa-globe"></i>
                  Site oficial
                </a>
                <a href="#" class="about-link">
                  <i class="fa fa-book"></i>
                  Documentação
                </a>
                <a href="#" class="about-link">
                  <i class="fa fa-github"></i>
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <template #footer>
      <button class="modern-btn" @click="resetToDefaults">
        <i class="fa fa-undo"></i>
        Restaurar Padrões
      </button>
      <div class="footer-spacer"></div>
      <button class="modern-btn" @click="close">
        Cancelar
      </button>
      <button class="modern-btn modern-btn--primary" @click="saveSettings">
        <i class="fa fa-save"></i>
        Salvar
      </button>
    </template>
  </ModernModal>
</template>

<script>
import ModernModal from './ModernModal.vue';

export default {
  name: 'ModernSettings',
  components: { ModernModal },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'close', 'settings-changed'],
  data() {
    return {
      isOpen: this.modelValue,
      activeSection: 'general',
      sections: [
        { id: 'general', name: 'Geral', icon: 'fa-cog' },
        { id: 'editor', name: 'Editor', icon: 'fa-code' },
        { id: 'blockly', name: 'Blockly', icon: 'fa-puzzle-piece' },
        { id: 'advanced', name: 'Avançado', icon: 'fa-wrench' },
        { id: 'about', name: 'Sobre', icon: 'fa-info-circle' }
      ],
      settings: {
        language: 'pt',
        theme: 'dark',
        autoSave: true,
        showWelcome: true,
        editor: {
          fontSize: 14,
          fontFamily: 'Monaco',
          wordWrap: true,
          lineNumbers: true,
          minimap: false,
          indentType: 'spaces',
          indentSize: 2
        },
        blockly: {
          theme: 'modern',
          sounds: true,
          grid: false,
          scrollbars: true,
          zoom: 1.0
        },
        advanced: {
          developerMode: false,
          experimentalFeatures: false,
          logLevel: 'info'
        }
      }
    }
  },
  watch: {
    modelValue(newVal) {
      this.isOpen = newVal;
    },
    isOpen(newVal) {
      this.$emit('update:modelValue', newVal);
    }
  },
  methods: {
    close() {
      this.isOpen = false;
    },
    saveSettings() {
      // Save settings to localStorage or global state
      try {
        localStorage.setItem('kbide-settings', JSON.stringify(this.settings));
        this.$emit('settings-changed', this.settings);
        
        // Apply settings immediately
        this.applySettings();
        
        this.close();
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    },
    applySettings() {
      // Apply theme
      document.documentElement.setAttribute('data-theme', this.settings.theme);
      
      // Apply other settings as needed
      if (this.$global) {
        this.$global.settings = { ...this.settings };
      }
    },
    resetToDefaults() {
      if (confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão?')) {
        this.settings = {
          language: 'pt',
          theme: 'dark',
          autoSave: true,
          showWelcome: true,
          editor: {
            fontSize: 14,
            fontFamily: 'Monaco',
            wordWrap: true,
            lineNumbers: true,
            minimap: false,
            indentType: 'spaces',
            indentSize: 2
          },
          blockly: {
            theme: 'modern',
            sounds: true,
            grid: false,
            scrollbars: true,
            zoom: 1.0
          },
          advanced: {
            developerMode: false,
            experimentalFeatures: false,
            logLevel: 'info'
          }
        };
      }
    },
    clearCache() {
      if (confirm('Tem certeza que deseja limpar o cache? Isso pode afetar o desempenho temporariamente.')) {
        // Clear cache logic
        localStorage.removeItem('kbide-cache');
        console.log('Cache cleared');
      }
    },
    resetSettings() {
      if (confirm('Tem certeza que deseja resetar todas as configurações? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('kbide-settings');
        this.resetToDefaults();
      }
    }
  },
  mounted() {
    // Load settings from localStorage
    try {
      const saved = localStorage.getItem('kbide-settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
}
</script>

<style scoped>
.settings-layout {
  display: flex;
  gap: 24px;
  min-height: 500px;
}

.settings-sidebar {
  width: 200px;
  flex-shrink: 0;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: var(--kb-radius);
  color: var(--kb-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 0.875rem;
}

.settings-nav__item:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text-primary);
}

.settings-nav__item--active {
  background: var(--kb-primary);
  color: white;
}

.settings-nav__item i {
  width: 16px;
  text-align: center;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
}

.settings-section {
  padding: 0 4px;
}

.settings-section__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--kb-text-primary);
  margin: 0 0 24px 0;
}

.settings-group {
  margin-bottom: 24px;
}

.settings-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--kb-text-primary);
  margin-bottom: 8px;
}

.settings-description {
  font-size: 0.75rem;
  color: var(--kb-text-muted);
  margin: 4px 0 0 0;
  line-height: 1.4;
}

.modern-select {
  width: 100%;
  padding: 10px 12px;
  background: var(--kb-surface);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  color: var(--kb-text-primary);
  font-size: 0.875rem;
  cursor: pointer;
}

.modern-select:focus {
  outline: none;
  border-color: var(--kb-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.modern-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--kb-surface);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  color: var(--kb-text-primary);
  font-size: 0.875rem;
}

.modern-input:focus {
  outline: none;
  border-color: var(--kb-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-unit .modern-input {
  width: 100px;
}

.input-unit {
  font-size: 0.875rem;
  color: var(--kb-text-muted);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--kb-text-primary);
}

.radio-option input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 16px;
  height: 16px;
  border: 2px solid var(--kb-border);
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
}

.radio-option input[type="radio"]:checked + .radio-custom {
  border-color: var(--kb-primary);
}

.radio-option input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 8px;
  height: 8px;
  background: var(--kb-primary);
  border-radius: 50%;
}

.settings-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--kb-text-primary);
}

.settings-checkbox input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 2px solid var(--kb-border);
  border-radius: 3px;
  position: relative;
  transition: all 0.2s ease;
}

.settings-checkbox input[type="checkbox"]:checked + .checkbox-custom {
  background: var(--kb-primary);
  border-color: var(--kb-primary);
}

.settings-checkbox input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.button-group {
  display: flex;
  gap: 8px;
}

.modern-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--kb-radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
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

.modern-btn--outline {
  background: transparent;
  border: 1px solid var(--kb-border);
}

.modern-btn--outline:hover {
  border-color: var(--kb-primary);
  color: var(--kb-primary);
}

.about-info {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.about-logo {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.about-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.about-details h4 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--kb-text-primary);
  margin: 0 0 8px 0;
}

.about-details p {
  color: var(--kb-text-secondary);
  margin: 0 0 4px 0;
  font-size: 0.875rem;
}

.about-links {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.about-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--kb-primary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: opacity 0.2s ease;
}

.about-link:hover {
  opacity: 0.8;
}

.footer-spacer {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-layout {
    flex-direction: column;
    gap: 16px;
  }
  
  .settings-sidebar {
    width: 100%;
  }
  
  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 8px;
    padding-bottom: 8px;
  }
  
  .settings-nav__item {
    flex-shrink: 0;
    padding: 8px 12px;
  }
  
  .about-info {
    flex-direction: column;
    text-align: center;
  }
  
  .about-links {
    justify-content: center;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>

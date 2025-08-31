<template>
  <ModernModal
    v-model="isOpen"
    title="Gerenciador de Plugins"
    icon="fa-puzzle-piece"
    size="large"
    @close="$emit('close')"
  >
    <!-- Search and Filters -->
    <div class="plugin-manager__header">
      <div class="plugin-manager__search">
        <div class="modern-search-input">
          <i class="fa fa-search"></i>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Pesquisar plugins..."
            class="modern-search-input__field"
          />
        </div>
      </div>
      
      <div class="plugin-manager__filters">
        <select v-model="selectedCategory" class="modern-select">
          <option value="">Todas as categorias</option>
          <option value="blocks">Blocos</option>
          <option value="themes">Temas</option>
          <option value="tools">Ferramentas</option>
          <option value="extensions">Extensões</option>
        </select>
        
        <select v-model="statusFilter" class="modern-select">
          <option value="">Todos os status</option>
          <option value="enabled">Habilitados</option>
          <option value="disabled">Desabilitados</option>
          <option value="available">Disponíveis</option>
        </select>
      </div>
    </div>

    <!-- Plugin List -->
    <div class="plugin-manager__content">
      <div class="plugin-list">
        <div 
          v-for="plugin in filteredPlugins" 
          :key="plugin.id"
          class="plugin-item"
          :class="{ 'plugin-item--selected': selectedPlugin?.id === plugin.id }"
          @click="selectPlugin(plugin)"
        >
          <div class="plugin-item__header">
            <div class="plugin-item__icon">
              <img 
                v-if="plugin.icon" 
                :src="plugin.icon" 
                :alt="plugin.name"
                @error="$event.target.style.display = 'none'"
              />
              <i v-else class="fa" :class="getCategoryIcon(plugin.category)"></i>
            </div>
            
            <div class="plugin-item__info">
              <h3 class="plugin-item__title">{{ plugin.name }}</h3>
              <p class="plugin-item__author">por {{ plugin.author }}</p>
              <p class="plugin-item__description">{{ plugin.description }}</p>
            </div>
            
            <div class="plugin-item__status">
              <span 
                class="status-badge"
                :class="`status-badge--${getStatusType(plugin.status)}`"
              >
                {{ getStatusText(plugin.status) }}
              </span>
            </div>
          </div>
          
          <div class="plugin-item__details">
            <div class="plugin-detail">
              <i class="fa fa-tag"></i>
              <span>v{{ plugin.version }}</span>
            </div>
            <div class="plugin-detail">
              <i class="fa fa-folder"></i>
              <span>{{ plugin.category }}</span>
            </div>
            <div class="plugin-detail">
              <i class="fa fa-download"></i>
              <span>{{ plugin.downloads }} downloads</span>
            </div>
            <div class="plugin-detail">
              <i class="fa fa-star"></i>
              <span>{{ plugin.rating }}/5</span>
            </div>
          </div>
          
          <!-- Plugin Features -->
          <div v-if="plugin.features && plugin.features.length > 0" class="plugin-item__features">
            <div class="features-list">
              <span 
                v-for="feature in plugin.features.slice(0, 3)" 
                :key="feature"
                class="feature-chip"
              >
                {{ feature }}
              </span>
              <span v-if="plugin.features.length > 3" class="feature-chip feature-chip--more">
                +{{ plugin.features.length - 3 }} mais
              </span>
            </div>
          </div>
          
          <div class="plugin-item__actions">
            <!-- Enable/Disable for installed plugins -->
            <button 
              v-if="plugin.status === 'enabled'"
              class="modern-btn modern-btn--secondary modern-btn--small"
              @click.stop="disablePlugin(plugin)"
              :disabled="toggling === plugin.id"
            >
              <i class="fa" :class="toggling === plugin.id ? 'fa-spinner fa-spin' : 'fa-pause'"></i>
              {{ toggling === plugin.id ? 'Desabilitando...' : 'Desabilitar' }}
            </button>
            
            <button 
              v-if="plugin.status === 'disabled'"
              class="modern-btn modern-btn--success modern-btn--small"
              @click.stop="enablePlugin(plugin)"
              :disabled="toggling === plugin.id"
            >
              <i class="fa" :class="toggling === plugin.id ? 'fa-spinner fa-spin' : 'fa-play'"></i>
              {{ toggling === plugin.id ? 'Habilitando...' : 'Habilitar' }}
            </button>
            
            <!-- Install for available plugins -->
            <button 
              v-if="plugin.status === 'available'"
              class="modern-btn modern-btn--primary modern-btn--small"
              @click.stop="installPlugin(plugin)"
              :disabled="installing === plugin.id"
            >
              <i class="fa" :class="installing === plugin.id ? 'fa-spinner fa-spin' : 'fa-download'"></i>
              {{ installing === plugin.id ? 'Instalando...' : 'Instalar' }}
            </button>
            
            <!-- Uninstall for installed plugins -->
            <button 
              v-if="plugin.status !== 'available'"
              class="modern-btn modern-btn--outline modern-btn--small"
              @click.stop="uninstallPlugin(plugin)"
              :disabled="uninstalling === plugin.id"
            >
              <i class="fa" :class="uninstalling === plugin.id ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
              {{ uninstalling === plugin.id ? 'Removendo...' : 'Remover' }}
            </button>
            
            <!-- Settings for installed plugins -->
            <button 
              v-if="plugin.status !== 'available' && plugin.hasSettings"
              class="modern-btn modern-btn--outline modern-btn--small"
              @click.stop="openPluginSettings(plugin)"
            >
              <i class="fa fa-cog"></i>
              Configurar
            </button>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredPlugins.length === 0" class="empty-state">
        <i class="fa fa-puzzle-piece"></i>
        <h3>Nenhum plugin encontrado</h3>
        <p>Tente ajustar os filtros de pesquisa</p>
      </div>
    </div>

    <!-- Footer Actions -->
    <template #footer>
      <button class="modern-btn" @click="refreshPlugins">
        <i class="fa fa-refresh"></i>
        Atualizar Lista
      </button>
      <button class="modern-btn" @click="openPluginStore">
        <i class="fa fa-store"></i>
        Loja de Plugins
      </button>
      <button class="modern-btn modern-btn--primary" @click="close">
        Fechar
      </button>
    </template>
  </ModernModal>
</template>

<script>
import ModernModal from './ModernModal.vue';

export default {
  name: 'ModernPluginManager',
  components: { ModernModal },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'close'],
  data() {
    return {
      isOpen: this.modelValue,
      searchQuery: '',
      selectedCategory: '',
      statusFilter: '',
      selectedPlugin: null,
      installing: null,
      uninstalling: null,
      toggling: null,
      plugins: [
        {
          id: 'advanced-blocks',
          name: 'Advanced Blocks',
          author: 'KBIDE Team',
          description: 'Conjunto de blocos avançados para programação com ESP32, incluindo sensores, atuadores e comunicação.',
          version: '2.1.0',
          category: 'blocks',
          status: 'enabled',
          downloads: 15420,
          rating: 4.8,
          icon: '/static/icons/advanced-blocks.png',
          hasSettings: true,
          features: ['Sensores DHT', 'Display OLED', 'WiFi Manager', 'MQTT Client', 'Web Server']
        },
        {
          id: 'dark-theme-pro',
          name: 'Dark Theme Pro',
          author: 'ThemeStudio',
          description: 'Tema escuro profissional com múltiplas variações de cores e suporte completo para todos os componentes.',
          version: '1.5.2',
          category: 'themes',
          status: 'disabled',
          downloads: 8930,
          rating: 4.6,
          icon: '/static/icons/dark-theme.png',
          hasSettings: true,
          features: ['5 Variações', 'Cores Customizáveis', 'Animações Suaves']
        },
        {
          id: 'code-formatter',
          name: 'Code Formatter',
          author: 'DevTools Inc',
          description: 'Formatador automático de código C++ com suporte a múltiplos estilos de formatação.',
          version: '3.0.1',
          category: 'tools',
          status: 'enabled',
          downloads: 12650,
          rating: 4.9,
          icon: '/static/icons/formatter.png',
          hasSettings: true,
          features: ['Auto Format', 'Multiple Styles', 'Custom Rules']
        },
        {
          id: 'iot-sensors',
          name: 'IoT Sensors Pack',
          author: 'IoT Solutions',
          description: 'Coleção completa de blocos para sensores IoT populares como BME280, MPU6050, e muitos outros.',
          version: '4.2.0',
          category: 'blocks',
          status: 'available',
          downloads: 23100,
          rating: 4.7,
          icon: '/static/icons/iot-sensors.png',
          hasSettings: false,
          features: ['BME280', 'MPU6050', 'HC-SR04', 'DS18B20', 'BH1750', 'MQ Sensors']
        },
        {
          id: 'blockly-extensions',
          name: 'Blockly Extensions',
          author: 'Extensions Team',
          description: 'Extensões para o editor Blockly incluindo novos tipos de blocos e funcionalidades avançadas.',
          version: '1.8.0',
          category: 'extensions',
          status: 'available',
          downloads: 6780,
          rating: 4.4,
          icon: '/static/icons/blockly-ext.png',
          hasSettings: true,
          features: ['Custom Blocks', 'Block Animations', 'Advanced Toolbox']
        },
        {
          id: 'serial-monitor-pro',
          name: 'Serial Monitor Pro',
          author: 'Debug Tools',
          description: 'Monitor serial avançado com gráficos em tempo real, filtros e exportação de dados.',
          version: '2.3.1',
          category: 'tools',
          status: 'enabled',
          downloads: 9840,
          rating: 4.5,
          icon: '/static/icons/serial-monitor.png',
          hasSettings: true,
          features: ['Real-time Charts', 'Data Export', 'Advanced Filters', 'Multiple Ports']
        }
      ]
    }
  },
  computed: {
    filteredPlugins() {
      let filtered = this.plugins;
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(plugin => 
          plugin.name.toLowerCase().includes(query) ||
          plugin.description.toLowerCase().includes(query) ||
          plugin.author.toLowerCase().includes(query) ||
          plugin.features.some(feature => feature.toLowerCase().includes(query))
        );
      }
      
      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(plugin => plugin.category === this.selectedCategory);
      }
      
      // Filter by status
      if (this.statusFilter) {
        filtered = filtered.filter(plugin => plugin.status === this.statusFilter);
      }
      
      return filtered;
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
    selectPlugin(plugin) {
      this.selectedPlugin = plugin;
    },
    async installPlugin(plugin) {
      this.installing = plugin.id;
      try {
        // Simulate installation
        await new Promise(resolve => setTimeout(resolve, 2000));
        plugin.status = 'enabled';
      } catch (error) {
        console.error('Error installing plugin:', error);
      } finally {
        this.installing = null;
      }
    },
    async uninstallPlugin(plugin) {
      this.uninstalling = plugin.id;
      try {
        // Simulate uninstallation
        await new Promise(resolve => setTimeout(resolve, 1000));
        plugin.status = 'available';
      } catch (error) {
        console.error('Error uninstalling plugin:', error);
      } finally {
        this.uninstalling = null;
      }
    },
    async enablePlugin(plugin) {
      this.toggling = plugin.id;
      try {
        // Simulate enabling
        await new Promise(resolve => setTimeout(resolve, 500));
        plugin.status = 'enabled';
      } catch (error) {
        console.error('Error enabling plugin:', error);
      } finally {
        this.toggling = null;
      }
    },
    async disablePlugin(plugin) {
      this.toggling = plugin.id;
      try {
        // Simulate disabling
        await new Promise(resolve => setTimeout(resolve, 500));
        plugin.status = 'disabled';
      } catch (error) {
        console.error('Error disabling plugin:', error);
      } finally {
        this.toggling = null;
      }
    },
    openPluginSettings(plugin) {
      console.log('Opening settings for plugin:', plugin.name);
      // Open plugin settings modal
    },
    openPluginStore() {
      console.log('Opening plugin store...');
      // Open plugin store or navigate to store page
    },
    async refreshPlugins() {
      console.log('Refreshing plugin list...');
    },
    getCategoryIcon(category) {
      switch (category) {
        case 'blocks': return 'fa-cubes';
        case 'themes': return 'fa-paint-brush';
        case 'tools': return 'fa-wrench';
        case 'extensions': return 'fa-puzzle-piece';
        default: return 'fa-plugin';
      }
    },
    getStatusType(status) {
      switch (status) {
        case 'enabled': return 'success';
        case 'disabled': return 'warning';
        case 'available': return 'info';
        default: return 'default';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 'enabled': return 'Habilitado';
        case 'disabled': return 'Desabilitado';
        case 'available': return 'Disponível';
        default: return 'Desconhecido';
      }
    }
  }
}
</script>

<style scoped>
.plugin-manager__header {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.plugin-manager__search {
  flex: 1;
  min-width: 200px;
}

.plugin-manager__filters {
  display: flex;
  gap: 12px;
}

.modern-search-input {
  position: relative;
  display: flex;
  align-items: center;
}

.modern-search-input i {
  position: absolute;
  left: 12px;
  color: var(--kb-text-muted);
  z-index: 1;
}

.modern-search-input__field {
  width: 100%;
  padding: 10px 12px 10px 40px;
  background: var(--kb-surface);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  color: var(--kb-text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.modern-search-input__field:focus {
  outline: none;
  border-color: var(--kb-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.modern-select {
  padding: 10px 12px;
  background: var(--kb-surface);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  color: var(--kb-text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 140px;
}

.plugin-manager__content {
  max-height: 500px;
  overflow-y: auto;
}

.plugin-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.plugin-item {
  background: var(--kb-surface);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius-lg);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plugin-item:hover {
  border-color: var(--kb-border-light);
  box-shadow: var(--kb-shadow);
}

.plugin-item--selected {
  border-color: var(--kb-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.plugin-item__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.plugin-item__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--kb-surface-3);
  border-radius: var(--kb-radius);
  flex-shrink: 0;
}

.plugin-item__icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.plugin-item__icon i {
  font-size: 24px;
  color: var(--kb-primary);
}

.plugin-item__info {
  flex: 1;
}

.plugin-item__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--kb-text-primary);
  margin: 0 0 4px 0;
}

.plugin-item__author {
  font-size: 0.75rem;
  color: var(--kb-text-muted);
  margin: 0 0 8px 0;
}

.plugin-item__description {
  font-size: 0.875rem;
  color: var(--kb-text-secondary);
  line-height: 1.4;
  margin: 0;
}

.plugin-item__status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: var(--kb-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge--success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--kb-success);
}

.status-badge--warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--kb-warning);
}

.status-badge--info {
  background: rgba(59, 130, 246, 0.1);
  color: var(--kb-primary);
}

.plugin-item__details {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.plugin-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--kb-text-muted);
}

.plugin-detail i {
  width: 12px;
}

.plugin-item__features {
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--kb-border);
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.feature-chip {
  padding: 4px 8px;
  background: var(--kb-surface-3);
  border-radius: var(--kb-radius-sm);
  font-size: 0.75rem;
  color: var(--kb-text-secondary);
}

.feature-chip--more {
  background: var(--kb-primary);
  color: white;
}

.plugin-item__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
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

.modern-btn--secondary {
  background: var(--kb-error);
  color: white;
}

.modern-btn--secondary:hover {
  background: #dc2626;
}

.modern-btn--success {
  background: var(--kb-success);
  color: white;
}

.modern-btn--success:hover {
  background: #059669;
}

.modern-btn--outline {
  background: transparent;
  border: 1px solid var(--kb-border);
}

.modern-btn--outline:hover {
  border-color: var(--kb-primary);
  color: var(--kb-primary);
}

.modern-btn--small {
  padding: 6px 12px;
  font-size: 0.75rem;
}

.modern-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--kb-text-muted);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--kb-text-secondary);
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .plugin-manager__header {
    flex-direction: column;
  }
  
  .plugin-manager__filters {
    flex-direction: column;
  }
  
  .plugin-item__actions {
    justify-content: flex-start;
  }
  
  .plugin-item__details {
    gap: 12px;
  }
  
  .plugin-detail {
    font-size: 0.7rem;
  }
}
</style>

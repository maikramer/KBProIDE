<template>
  <ModernModal
    v-model="isOpen"
    title="Gerenciador de Plataformas"
    icon="fa-cogs"
    size="large"
    @close="$emit('close')"
  >
    <!-- Search and Filters -->
    <div class="platform-manager__header">
      <div class="platform-manager__search">
        <div class="modern-search-input">
          <i class="fa fa-search"></i>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Pesquisar plataformas..."
            class="modern-search-input__field"
          />
        </div>
      </div>
      
      <div class="platform-manager__filters">
        <select v-model="selectedCategory" class="modern-select">
          <option value="">Todas as categorias</option>
          <option value="arduino">Arduino</option>
          <option value="esp">ESP</option>
          <option value="arm">ARM</option>
        </select>
        
        <select v-model="statusFilter" class="modern-select">
          <option value="">Todos os status</option>
          <option value="installed">Instalados</option>
          <option value="available">Disponíveis</option>
          <option value="updates">Com Atualizações</option>
        </select>
      </div>
    </div>

    <!-- Platform List -->
    <div class="platform-manager__content">
      <div class="platform-list">
        <div 
          v-for="platform in filteredPlatforms" 
          :key="platform.name"
          class="platform-item"
          :class="{ 'platform-item--selected': selectedPlatform?.name === platform.name }"
          @click="selectPlatform(platform)"
        >
          <div class="platform-item__header">
            <div class="platform-item__icon">
              <img 
                v-if="platform.icon" 
                :src="platform.icon" 
                :alt="platform.title"
                @error="$event.target.style.display = 'none'"
              />
              <i v-else class="fa fa-cogs"></i>
            </div>
            
            <div class="platform-item__info">
              <h3 class="platform-item__title">{{ platform.title }}</h3>
              <p class="platform-item__description">{{ platform.description }}</p>
              <div class="platform-item__meta">
                <span class="platform-meta">
                  <i class="fa fa-tag"></i>
                  v{{ platform.version }}
                </span>
                <span class="platform-meta">
                  <i class="fa fa-calendar"></i>
                  {{ formatDate(platform.lastUpdate) }}
                </span>
                <span class="platform-meta">
                  <i class="fa fa-download"></i>
                  {{ platform.size }}
                </span>
              </div>
            </div>
            
            <div class="platform-item__status">
              <span 
                class="status-badge"
                :class="`status-badge--${getStatusType(platform.status)}`"
              >
                {{ getStatusText(platform.status) }}
              </span>
            </div>
          </div>
          
          <!-- Boards supported by this platform -->
          <div v-if="platform.boards && platform.boards.length > 0" class="platform-item__boards">
            <h4 class="boards-title">Placas Suportadas:</h4>
            <div class="boards-list">
              <span 
                v-for="board in platform.boards.slice(0, 5)" 
                :key="board"
                class="board-chip"
              >
                {{ board }}
              </span>
              <span v-if="platform.boards.length > 5" class="board-chip board-chip--more">
                +{{ platform.boards.length - 5 }} mais
              </span>
            </div>
          </div>
          
          <div class="platform-item__actions">
            <button 
              v-if="platform.status === 'installed'"
              class="modern-btn modern-btn--secondary modern-btn--small"
              @click.stop="removePlatform(platform)"
              :disabled="removing === platform.name"
            >
              <i class="fa" :class="removing === platform.name ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
              {{ removing === platform.name ? 'Removendo...' : 'Remover' }}
            </button>
            
            <button 
              v-if="platform.status === 'available'"
              class="modern-btn modern-btn--primary modern-btn--small"
              @click.stop="installPlatform(platform)"
              :disabled="installing === platform.name"
            >
              <i class="fa" :class="installing === platform.name ? 'fa-spinner fa-spin' : 'fa-download'"></i>
              {{ installing === platform.name ? 'Instalando...' : 'Instalar' }}
            </button>
            
            <button 
              v-if="platform.status === 'update_available'"
              class="modern-btn modern-btn--warning modern-btn--small"
              @click.stop="updatePlatform(platform)"
              :disabled="updating === platform.name"
            >
              <i class="fa" :class="updating === platform.name ? 'fa-spinner fa-spin' : 'fa-refresh'"></i>
              {{ updating === platform.name ? 'Atualizando...' : 'Atualizar' }}
            </button>
            
            <button 
              v-if="platform.status === 'installed'"
              class="modern-btn modern-btn--outline modern-btn--small"
              @click.stop="viewDetails(platform)"
            >
              <i class="fa fa-info-circle"></i>
              Detalhes
            </button>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredPlatforms.length === 0" class="empty-state">
        <i class="fa fa-search"></i>
        <h3>Nenhuma plataforma encontrada</h3>
        <p>Tente ajustar os filtros de pesquisa</p>
      </div>
    </div>

    <!-- Footer Actions -->
    <template #footer>
      <button class="modern-btn" @click="refreshPlatforms">
        <i class="fa fa-refresh"></i>
        Atualizar Lista
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
  name: 'ModernPlatformManager',
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
      selectedPlatform: null,
      installing: null,
      updating: null,
      removing: null,
      platforms: [
        {
          name: 'arduino-esp32',
          title: 'ESP32 Arduino',
          description: 'Plataforma Arduino para microcontroladores ESP32 com WiFi e Bluetooth.',
          version: '2.0.11',
          size: '45.2 MB',
          status: 'installed',
          category: 'esp',
          lastUpdate: new Date('2023-10-15'),
          icon: '/static/icons/esp32.png',
          boards: ['ESP32 Dev Module', 'ESP32-S2', 'ESP32-C3', 'ESP32-S3', 'TTGO T-Display']
        },
        {
          name: 'arduino-avr',
          title: 'Arduino AVR Boards',
          description: 'Suporte oficial para placas Arduino baseadas em AVR (Uno, Nano, Mega, etc).',
          version: '1.8.6',
          size: '12.8 MB',
          status: 'update_available',
          category: 'arduino',
          lastUpdate: new Date('2023-09-20'),
          icon: '/static/icons/arduino.png',
          boards: ['Arduino Uno', 'Arduino Nano', 'Arduino Mega', 'Arduino Pro Mini', 'Arduino Leonardo']
        },
        {
          name: 'esp8266',
          title: 'ESP8266 Community',
          description: 'Plataforma para microcontroladores ESP8266 com WiFi integrado.',
          version: '3.1.2',
          size: '28.5 MB',
          status: 'available',
          category: 'esp',
          lastUpdate: new Date('2023-11-02'),
          icon: '/static/icons/esp8266.png',
          boards: ['NodeMCU 1.0', 'Wemos D1 Mini', 'ESP8266 Generic', 'Adafruit Feather HUZZAH']
        },
        {
          name: 'arduino-samd',
          title: 'Arduino SAMD Boards',
          description: 'Suporte para placas Arduino baseadas em ARM Cortex-M0+ (Zero, MKR, etc).',
          version: '1.8.13',
          size: '18.7 MB',
          status: 'available',
          category: 'arm',
          lastUpdate: new Date('2023-08-10'),
          icon: '/static/icons/arduino.png',
          boards: ['Arduino Zero', 'Arduino MKR1000', 'Arduino MKR WiFi 1010', 'Arduino Nano 33 IoT']
        },
        {
          name: 'esp-idf',
          title: 'Espressif ESP-IDF',
          description: 'Framework oficial de desenvolvimento da Espressif para ESP32.',
          version: '5.1.1',
          size: '156.3 MB',
          status: 'available',
          category: 'esp',
          lastUpdate: new Date('2023-11-15'),
          icon: '/static/icons/esp-idf.png',
          boards: ['ESP32', 'ESP32-S2', 'ESP32-C3', 'ESP32-S3', 'ESP32-C6']
        }
      ]
    }
  },
  computed: {
    filteredPlatforms() {
      let filtered = this.platforms;
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(platform => 
          platform.title.toLowerCase().includes(query) ||
          platform.description.toLowerCase().includes(query) ||
          platform.boards.some(board => board.toLowerCase().includes(query))
        );
      }
      
      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(platform => platform.category === this.selectedCategory);
      }
      
      // Filter by status
      if (this.statusFilter) {
        switch (this.statusFilter) {
          case 'installed':
            filtered = filtered.filter(platform => platform.status === 'installed');
            break;
          case 'available':
            filtered = filtered.filter(platform => platform.status === 'available');
            break;
          case 'updates':
            filtered = filtered.filter(platform => platform.status === 'update_available');
            break;
        }
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
    selectPlatform(platform) {
      this.selectedPlatform = platform;
    },
    async installPlatform(platform) {
      this.installing = platform.name;
      try {
        // Simulate installation
        await new Promise(resolve => setTimeout(resolve, 3000));
        platform.status = 'installed';
      } catch (error) {
        console.error('Error installing platform:', error);
      } finally {
        this.installing = null;
      }
    },
    async updatePlatform(platform) {
      this.updating = platform.name;
      try {
        // Simulate update
        await new Promise(resolve => setTimeout(resolve, 2000));
        platform.status = 'installed';
        platform.version = '1.9.0'; // Simulate version update
      } catch (error) {
        console.error('Error updating platform:', error);
      } finally {
        this.updating = null;
      }
    },
    async removePlatform(platform) {
      this.removing = platform.name;
      try {
        // Simulate removal
        await new Promise(resolve => setTimeout(resolve, 1000));
        platform.status = 'available';
      } catch (error) {
        console.error('Error removing platform:', error);
      } finally {
        this.removing = null;
      }
    },
    viewDetails(platform) {
      // Open platform details modal or navigate to details view
      console.log('View details for:', platform.name);
    },
    async refreshPlatforms() {
      console.log('Refreshing platform list...');
    },
    getStatusType(status) {
      switch (status) {
        case 'installed': return 'success';
        case 'available': return 'info';
        case 'update_available': return 'warning';
        default: return 'default';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 'installed': return 'Instalado';
        case 'available': return 'Disponível';
        case 'update_available': return 'Atualização Disponível';
        default: return 'Desconhecido';
      }
    },
    formatDate(date) {
      return date.toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }
}
</script>

<style scoped>
.platform-manager__header {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.platform-manager__search {
  flex: 1;
  min-width: 200px;
}

.platform-manager__filters {
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

.platform-manager__content {
  max-height: 500px;
  overflow-y: auto;
}

.platform-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.platform-item {
  background: var(--kb-surface);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius-lg);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.platform-item:hover {
  border-color: var(--kb-border-light);
  box-shadow: var(--kb-shadow);
}

.platform-item--selected {
  border-color: var(--kb-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.platform-item__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.platform-item__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--kb-surface-3);
  border-radius: var(--kb-radius);
  flex-shrink: 0;
}

.platform-item__icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.platform-item__icon i {
  font-size: 24px;
  color: var(--kb-primary);
}

.platform-item__info {
  flex: 1;
}

.platform-item__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--kb-text-primary);
  margin: 0 0 8px 0;
}

.platform-item__description {
  font-size: 0.875rem;
  color: var(--kb-text-secondary);
  line-height: 1.4;
  margin: 0 0 12px 0;
}

.platform-item__meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.platform-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--kb-text-muted);
}

.platform-meta i {
  width: 12px;
}

.platform-item__status {
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

.platform-item__boards {
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--kb-border);
}

.boards-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--kb-text-secondary);
  margin: 0 0 8px 0;
}

.boards-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.board-chip {
  padding: 4px 8px;
  background: var(--kb-surface-3);
  border-radius: var(--kb-radius-sm);
  font-size: 0.75rem;
  color: var(--kb-text-secondary);
}

.board-chip--more {
  background: var(--kb-primary);
  color: white;
}

.platform-item__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
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

.modern-btn--warning {
  background: var(--kb-warning);
  color: white;
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
  .platform-manager__header {
    flex-direction: column;
  }
  
  .platform-manager__filters {
    flex-direction: column;
  }
  
  .platform-item__actions {
    flex-wrap: wrap;
  }
  
  .platform-meta {
    font-size: 0.7rem;
  }
}
</style>

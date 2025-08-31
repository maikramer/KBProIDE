<template>
  <ModernModal
    v-model="isOpen"
    title="Gerenciador de Placas"
    icon="fa-microchip"
    size="large"
    @close="$emit('close')"
  >
    <!-- Search and Filters -->
    <div class="board-manager__header">
      <div class="board-manager__search">
        <div class="modern-search-input">
          <i class="fa fa-search"></i>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Pesquisar placas..."
            class="modern-search-input__field"
          />
        </div>
      </div>
      
      <div class="board-manager__filters">
        <select v-model="selectedPlatform" class="modern-select">
          <option value="">Todas as plataformas</option>
          <option v-for="platform in platforms" :key="platform" :value="platform">
            {{ platform }}
          </option>
        </select>
        
        <select v-model="sortBy" class="modern-select">
          <option value="name">Ordenar por Nome</option>
          <option value="platform">Ordenar por Plataforma</option>
          <option value="vendor">Ordenar por Fabricante</option>
        </select>
      </div>
    </div>

    <!-- Board List -->
    <div class="board-manager__content">
      <div class="board-grid">
        <div 
          v-for="board in filteredBoards" 
          :key="board.name"
          class="board-card"
          :class="{ 'board-card--selected': selectedBoard?.name === board.name }"
          @click="selectBoard(board)"
        >
          <div class="board-card__header">
            <div class="board-card__icon">
              <img 
                v-if="board.icon" 
                :src="board.icon" 
                :alt="board.title"
                @error="$event.target.style.display = 'none'"
              />
              <i v-else class="fa fa-microchip"></i>
            </div>
            <div class="board-card__info">
              <h3 class="board-card__title">{{ board.title }}</h3>
              <p class="board-card__platform">{{ board.platform }}</p>
            </div>
            <div class="board-card__status">
              <span 
                class="status-badge"
                :class="`status-badge--${getStatusType(board.status)}`"
              >
                {{ getStatusText(board.status) }}
              </span>
            </div>
          </div>
          
          <div class="board-card__description">
            {{ board.description || 'Placa de desenvolvimento para projetos IoT e embarcados.' }}
          </div>
          
          <div class="board-card__details">
            <div class="board-detail">
              <i class="fa fa-tag"></i>
              <span>v{{ board.version || '1.0.0' }}</span>
            </div>
            <div class="board-detail">
              <i class="fa fa-user"></i>
              <span>{{ board.vendor || 'Arduino' }}</span>
            </div>
          </div>
          
          <div class="board-card__actions">
            <button 
              v-if="board.status === 'READY'"
              class="modern-btn modern-btn--primary modern-btn--small"
              @click.stop="useBoard(board)"
            >
              <i class="fa fa-check"></i>
              Usar
            </button>
            <button 
              v-else-if="board.status === 'NOT_INSTALLED'"
              class="modern-btn modern-btn--primary modern-btn--small"
              @click.stop="installBoard(board)"
              :disabled="installing === board.name"
            >
              <i class="fa" :class="installing === board.name ? 'fa-spinner fa-spin' : 'fa-download'"></i>
              {{ installing === board.name ? 'Instalando...' : 'Instalar' }}
            </button>
            <button 
              v-else-if="board.status === 'UPDATE_AVAILABLE'"
              class="modern-btn modern-btn--warning modern-btn--small"
              @click.stop="updateBoard(board)"
              :disabled="updating === board.name"
            >
              <i class="fa" :class="updating === board.name ? 'fa-spinner fa-spin' : 'fa-refresh'"></i>
              {{ updating === board.name ? 'Atualizando...' : 'Atualizar' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredBoards.length === 0" class="empty-state">
        <i class="fa fa-search"></i>
        <h3>Nenhuma placa encontrada</h3>
        <p>Tente ajustar os filtros de pesquisa</p>
      </div>
    </div>

    <!-- Footer Actions -->
    <template #footer>
      <button class="modern-btn" @click="refreshBoards">
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
  name: 'ModernBoardManager',
  components: { ModernModal },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'close', 'board-selected'],
  data() {
    return {
      isOpen: this.modelValue,
      searchQuery: '',
      selectedPlatform: '',
      sortBy: 'name',
      selectedBoard: null,
      installing: null,
      updating: null,
      boards: [
        {
          name: 'esp32',
          title: 'ESP32 Dev Module',
          platform: 'ESP32',
          vendor: 'Espressif',
          version: '2.0.11',
          status: 'READY',
          description: 'Placa de desenvolvimento ESP32 com WiFi e Bluetooth integrados.',
          icon: '/static/icons/esp32.png'
        },
        {
          name: 'arduino-uno',
          title: 'Arduino Uno',
          platform: 'Arduino AVR',
          vendor: 'Arduino',
          version: '1.8.6',
          status: 'NOT_INSTALLED',
          description: 'Placa Arduino Uno R3 com microcontrolador ATmega328P.',
          icon: '/static/icons/arduino.png'
        },
        {
          name: 'arduino-nano',
          title: 'Arduino Nano',
          platform: 'Arduino AVR',
          vendor: 'Arduino',
          version: '1.8.6',
          status: 'UPDATE_AVAILABLE',
          description: 'Placa Arduino Nano compacta para projetos pequenos.',
          icon: '/static/icons/arduino.png'
        },
        {
          name: 'nodemcu',
          title: 'NodeMCU 1.0',
          platform: 'ESP8266',
          vendor: 'NodeMCU',
          version: '3.1.2',
          status: 'READY',
          description: 'Placa de desenvolvimento ESP8266 com WiFi integrado.',
          icon: '/static/icons/nodemcu.png'
        }
      ]
    }
  },
  computed: {
    platforms() {
      return [...new Set(this.boards.map(board => board.platform))];
    },
    filteredBoards() {
      let filtered = this.boards;
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(board => 
          board.title.toLowerCase().includes(query) ||
          board.platform.toLowerCase().includes(query) ||
          board.vendor.toLowerCase().includes(query)
        );
      }
      
      // Filter by platform
      if (this.selectedPlatform) {
        filtered = filtered.filter(board => board.platform === this.selectedPlatform);
      }
      
      // Sort
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'name':
            return a.title.localeCompare(b.title);
          case 'platform':
            return a.platform.localeCompare(b.platform);
          case 'vendor':
            return a.vendor.localeCompare(b.vendor);
          default:
            return 0;
        }
      });
      
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
    selectBoard(board) {
      this.selectedBoard = board;
    },
    useBoard(board) {
      this.$emit('board-selected', board);
      if (this.$global.board) {
        this.$global.board.board_info = board;
        this.$global.board.board = board.name;
      }
      this.close();
    },
    async installBoard(board) {
      this.installing = board.name;
      try {
        // Simulate installation
        await new Promise(resolve => setTimeout(resolve, 2000));
        board.status = 'READY';
      } catch (error) {
        console.error('Error installing board:', error);
      } finally {
        this.installing = null;
      }
    },
    async updateBoard(board) {
      this.updating = board.name;
      try {
        // Simulate update
        await new Promise(resolve => setTimeout(resolve, 1500));
        board.status = 'READY';
      } catch (error) {
        console.error('Error updating board:', error);
      } finally {
        this.updating = null;
      }
    },
    async refreshBoards() {
      // Simulate refresh
      console.log('Refreshing board list...');
    },
    getStatusType(status) {
      switch (status) {
        case 'READY': return 'success';
        case 'NOT_INSTALLED': return 'warning';
        case 'UPDATE_AVAILABLE': return 'info';
        default: return 'default';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 'READY': return 'Instalado';
        case 'NOT_INSTALLED': return 'Não Instalado';
        case 'UPDATE_AVAILABLE': return 'Atualização Disponível';
        default: return 'Desconhecido';
      }
    }
  }
}
</script>

<style scoped>
.board-manager__header {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.board-manager__search {
  flex: 1;
  min-width: 200px;
}

.board-manager__filters {
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

.modern-select:focus {
  outline: none;
  border-color: var(--kb-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.board-manager__content {
  max-height: 500px;
  overflow-y: auto;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.board-card {
  background: var(--kb-surface);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius-lg);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.board-card:hover {
  border-color: var(--kb-border-light);
  box-shadow: var(--kb-shadow);
}

.board-card--selected {
  border-color: var(--kb-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.board-card__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.board-card__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--kb-surface-3);
  border-radius: var(--kb-radius);
  flex-shrink: 0;
}

.board-card__icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.board-card__icon i {
  font-size: 20px;
  color: var(--kb-primary);
}

.board-card__info {
  flex: 1;
}

.board-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--kb-text-primary);
  margin: 0 0 4px 0;
}

.board-card__platform {
  font-size: 0.875rem;
  color: var(--kb-text-muted);
  margin: 0;
}

.board-card__status {
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

.board-card__description {
  color: var(--kb-text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 16px;
}

.board-card__details {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.board-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--kb-text-muted);
}

.board-detail i {
  width: 12px;
}

.board-card__actions {
  display: flex;
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

.modern-btn--warning {
  background: var(--kb-warning);
  color: white;
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
  .board-grid {
    grid-template-columns: 1fr;
  }
  
  .board-manager__header {
    flex-direction: column;
  }
  
  .board-manager__filters {
    flex-direction: column;
  }
}
</style>

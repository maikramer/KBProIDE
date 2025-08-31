<template>
  <div class="modern-blockly-toolbox">
    <!-- Toolbox Header with Search -->
    <div class="modern-blockly-toolbox__header">
      <div class="modern-blockly-toolbox__title">
        <i class="fa fa-puzzle-piece"></i>
        <span>Blocos</span>
      </div>
      <div class="modern-blockly-toolbox__search">
        <div class="modern-search-input">
          <i class="fa fa-search"></i>
          <input 
            v-model="searchQuery"
            @input="onSearchInput"
            type="text" 
            placeholder="Pesquisar blocos..."
            class="modern-search-input__field"
          />
          <button 
            v-if="searchQuery"
            @click="clearSearch"
            class="modern-search-input__clear"
            title="Limpar pesquisa"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Toolbox Categories -->
    <div class="modern-blockly-toolbox__content" ref="toolboxContent">
      <div v-if="!searchQuery" class="modern-blockly-categories">
        <div 
          v-for="category in categories" 
          :key="category.name"
          class="modern-blockly-category"
          :class="{ 'modern-blockly-category--active': activeCategory === category.name }"
          @click="selectCategory(category)"
          :style="{ borderLeftColor: category.colour }"
        >
          <div class="modern-blockly-category__icon">
            <img v-if="category.icon" :src="category.icon" :alt="category.name" />
            <i v-else class="fa fa-cube"></i>
          </div>
          <span class="modern-blockly-category__name">{{ category.name }}</span>
          <div class="modern-blockly-category__count">{{ category.blocks?.length || 0 }}</div>
        </div>
      </div>

      <!-- Search Results -->
      <div v-else class="modern-blockly-search-results">
        <div class="modern-blockly-search-header">
          <span>{{ filteredBlocks.length }} resultado(s) para "{{ searchQuery }}"</span>
        </div>
        <div 
          v-for="block in filteredBlocks" 
          :key="block.type"
          class="modern-blockly-search-item"
          @click="insertBlock(block)"
        >
          <div class="modern-blockly-search-item__icon">
            <i class="fa fa-cube" :style="{ color: block.categoryColour }"></i>
          </div>
          <div class="modern-blockly-search-item__content">
            <div class="modern-blockly-search-item__name">{{ block.name || block.type }}</div>
            <div class="modern-blockly-search-item__category">{{ block.categoryName }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Blocks (when category is selected) -->
    <div 
      v-if="!searchQuery && activeCategory"
      class="modern-blockly-blocks"
    >
      <div class="modern-blockly-blocks__header">
        <button 
          class="modern-blockly-blocks__back"
          @click="activeCategory = null"
        >
          <i class="fa fa-arrow-left"></i>
        </button>
        <span>{{ activeCategoryData?.name }}</span>
        <div class="modern-blockly-blocks__count">
          {{ selectedCategoryBlocks.length }} blocos
        </div>
      </div>
      <div class="modern-blockly-blocks__content">
        <div class="modern-blockly-blocks__list">
          <div 
            v-for="block in selectedCategoryBlocks"
            :key="block.type"
            class="modern-blockly-block-item"
            :class="{ 'modern-blockly-block-item--active': previewedBlock?.type === block.type }"
            @click="insertBlock(block)"
            @mouseenter="previewBlock(block)"
            @mouseleave="clearPreview"
          >
            <div class="modern-blockly-block-item__preview">
              <!-- Visual block preview -->
              <div 
                class="block-preview"
                :style="{ 
                  backgroundColor: activeCategoryData?.colour || '#5C81A6',
                  borderColor: activeCategoryData?.colour || '#5C81A6'
                }"
              >
                <div class="block-preview__connector"></div>
                <div class="block-preview__content">
                  <i class="fa fa-cube"></i>
                </div>
                <div class="block-preview__connector block-preview__connector--output"></div>
              </div>
            </div>
            <div class="modern-blockly-block-item__info">
              <div class="modern-blockly-block-item__name">{{ block.name || block.type }}</div>
              <div class="modern-blockly-block-item__type">{{ block.type }}</div>
            </div>
          </div>
        </div>
        
        <!-- Block Preview Panel -->
        <div 
          v-if="previewedBlock"
          class="modern-blockly-preview"
        >
          <div class="modern-blockly-preview__header">
            <h4>{{ previewedBlock.name || previewedBlock.type }}</h4>
          </div>
          <div class="modern-blockly-preview__content">
            <div 
              class="block-preview-large"
              :style="{ 
                backgroundColor: activeCategoryData?.colour || '#5C81A6',
                borderColor: activeCategoryData?.colour || '#5C81A6'
              }"
            >
              <div class="block-preview-large__content">
                <i class="fa fa-cube"></i>
                <span>{{ previewedBlock.name || previewedBlock.type }}</span>
              </div>
            </div>
            <p class="block-description">
              {{ getBlockDescription(previewedBlock) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModernBlocklyToolbox',
  props: {
    toolboxData: {
      type: Object,
      default: () => ({ categories: [] })
    }
  },
  emits: ['search', 'block-insert', 'category-select'],
  data() {
    return {
      searchQuery: '',
      activeCategory: null,
      searchTimeout: null,
      previewedBlock: null
    }
  },
  computed: {
    categories() {
      return this.toolboxData.categories || [];
    },
    activeCategoryData() {
      return this.categories.find(cat => cat.name === this.activeCategory);
    },
    selectedCategoryBlocks() {
      return this.activeCategoryData?.blocks || [];
    },
    allBlocks() {
      const blocks = [];
      this.categories.forEach(category => {
        if (category.blocks) {
          category.blocks.forEach(block => {
            blocks.push({
              ...block,
              categoryName: category.name,
              categoryColour: category.colour
            });
          });
        }
      });
      return blocks;
    },
    filteredBlocks() {
      if (!this.searchQuery.trim()) return [];
      
      const query = this.searchQuery.toLowerCase().trim();
      return this.allBlocks.filter(block => {
        const name = (block.name || block.type || '').toLowerCase();
        const category = (block.categoryName || '').toLowerCase();
        return name.includes(query) || category.includes(query);
      });
    }
  },
  methods: {
    onSearchInput() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.$emit('search', this.searchQuery);
      }, 300);
    },
    clearSearch() {
      this.searchQuery = '';
      this.$emit('search', '');
    },
    selectCategory(category) {
      this.activeCategory = category.name;
      this.$emit('category-select', category);
    },
    insertBlock(block) {
      this.$emit('block-insert', block);
    },
    previewBlock(block) {
      this.previewedBlock = block;
    },
    clearPreview() {
      this.previewedBlock = null;
    },
    getBlockDescription(block) {
      // Return description based on block type
      const descriptions = {
        'controls_if': 'Executa código condicionalmente baseado em uma condição verdadeira ou falsa.',
        'logic_compare': 'Compara dois valores e retorna verdadeiro ou falso.',
        'logic_operation': 'Realiza operações lógicas como E, OU, ou OU EXCLUSIVO.',
        'logic_negate': 'Inverte o valor lógico: verdadeiro vira falso e vice-versa.',
        'logic_boolean': 'Representa um valor verdadeiro ou falso.',
        'controls_repeat_ext': 'Repete um bloco de código um número específico de vezes.',
        'controls_whileUntil': 'Repete código enquanto ou até uma condição for verdadeira.',
        'controls_for': 'Conta de um número inicial até um final, executando código a cada iteração.',
        'controls_forEach': 'Executa código para cada item em uma lista.',
        'math_number': 'Representa um número que pode ser usado em cálculos.',
        'math_arithmetic': 'Realiza operações matemáticas básicas como soma, subtração, multiplicação e divisão.',
        'math_single': 'Funções matemáticas como raiz quadrada, valor absoluto, etc.',
        'math_trig': 'Funções trigonométricas como seno, cosseno e tangente.',
        'text': 'Representa uma sequência de caracteres (texto).',
        'text_join': 'Combina múltiplos textos em um único texto.',
        'text_append': 'Adiciona texto ao final de uma variável de texto.',
        'text_length': 'Retorna o número de caracteres em um texto.',
        'gpio_set_mode': 'Configura um pino GPIO como entrada ou saída.',
        'gpio_digital_write': 'Define o estado de um pino digital como HIGH ou LOW.',
        'gpio_digital_read': 'Lê o estado atual de um pino digital.',
        'gpio_analog_read': 'Lê o valor analógico de um pino (0-4095 no ESP32).'
      };
      
      return descriptions[block.type] || `Bloco ${block.name || block.type} para programação visual.`;
    }
  }
}
</script>

<style scoped>
.modern-blockly-toolbox {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--kb-surface-2);
  border-right: 1px solid var(--kb-border);
}

.modern-blockly-toolbox__header {
  padding: 12px 16px;
  background: var(--kb-surface-3);
  border-bottom: 1px solid var(--kb-border);
  flex-shrink: 0;
}

.modern-blockly-toolbox__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--kb-text-primary);
  margin-bottom: 12px;
}

.modern-blockly-toolbox__title i {
  color: var(--kb-primary);
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
  padding: 8px 12px 8px 36px;
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

.modern-search-input__clear {
  position: absolute;
  right: 8px;
  padding: 4px;
  background: none;
  border: none;
  color: var(--kb-text-muted);
  cursor: pointer;
  border-radius: var(--kb-radius-sm);
  transition: all 0.2s ease;
}

.modern-search-input__clear:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text-primary);
}

.modern-blockly-toolbox__content {
  flex: 1;
  overflow: auto;
}

/* Categories */
.modern-blockly-categories {
  padding: 8px 0;
}

.modern-blockly-category {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  position: relative;
}

.modern-blockly-category:hover {
  background: var(--kb-surface-hover);
}

.modern-blockly-category--active {
  background: var(--kb-surface-hover);
}

.modern-blockly-category__icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modern-blockly-category__icon img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.modern-blockly-category__icon i {
  font-size: 16px;
  color: var(--kb-text-muted);
}

.modern-blockly-category__name {
  flex: 1;
  color: var(--kb-text-primary);
  font-weight: 500;
}

.modern-blockly-category__count {
  padding: 2px 6px;
  background: var(--kb-surface-3);
  border-radius: var(--kb-radius-sm);
  font-size: 0.75rem;
  color: var(--kb-text-muted);
}

/* Search Results */
.modern-blockly-search-results {
  padding: 8px 0;
}

.modern-blockly-search-header {
  padding: 8px 16px;
  font-size: 0.75rem;
  color: var(--kb-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--kb-border);
  margin-bottom: 8px;
}

.modern-blockly-search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modern-blockly-search-item:hover {
  background: var(--kb-surface-hover);
}

.modern-blockly-search-item__icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modern-blockly-search-item__content {
  flex: 1;
}

.modern-blockly-search-item__name {
  color: var(--kb-text-primary);
  font-weight: 500;
  margin-bottom: 2px;
}

.modern-blockly-search-item__category {
  color: var(--kb-text-muted);
  font-size: 0.75rem;
}

/* Category Blocks */
.modern-blockly-blocks {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--kb-surface-2);
  display: flex;
  flex-direction: column;
}

.modern-blockly-blocks__content {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.modern-blockly-blocks__header {
  padding: 12px 16px;
  background: var(--kb-surface-3);
  border-bottom: 1px solid var(--kb-border);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.modern-blockly-blocks__count {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--kb-text-muted);
  background: var(--kb-surface);
  padding: 4px 8px;
  border-radius: var(--kb-radius-sm);
}

.modern-blockly-blocks__back {
  padding: 8px;
  background: none;
  border: none;
  color: var(--kb-text-secondary);
  cursor: pointer;
  border-radius: var(--kb-radius);
  transition: all 0.2s ease;
}

.modern-blockly-blocks__back:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text-primary);
}

.modern-blockly-blocks__list {
  flex: 1;
  overflow: auto;
  padding: 8px 0;
  transition: margin-right 0.3s ease;
}

.modern-blockly-blocks__list:has(.modern-blockly-preview) {
  margin-right: 250px;
}

.modern-blockly-block-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modern-blockly-block-item:hover {
  background: var(--kb-surface-hover);
}

.modern-blockly-block-item--active {
  background: var(--kb-surface-hover);
  border-left: 3px solid var(--kb-primary);
}

.modern-blockly-block-item__preview {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modern-blockly-block-item__info {
  flex: 1;
}

.modern-blockly-block-item__name {
  color: var(--kb-text-primary);
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 2px;
}

.modern-blockly-block-item__type {
  color: var(--kb-text-muted);
  font-size: 0.75rem;
  font-family: monospace;
}

/* Block Preview Styles */
.block-preview {
  width: 60px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid;
  display: flex;
  align-items: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.block-preview__connector {
  width: 8px;
  height: 8px;
  background: var(--kb-surface);
  border-radius: 50%;
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid var(--kb-border);
}

.block-preview__connector--output {
  left: auto;
  right: -4px;
}

.block-preview__content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

/* Large Block Preview */
.modern-blockly-preview {
  position: absolute;
  top: 0;
  right: 0;
  width: 250px;
  height: 100%;
  background: var(--kb-surface);
  border-left: 1px solid var(--kb-border);
  z-index: 10;
}

.modern-blockly-preview__header {
  padding: 12px 16px;
  background: var(--kb-surface-3);
  border-bottom: 1px solid var(--kb-border);
}

.modern-blockly-preview__header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--kb-text-primary);
}

.modern-blockly-preview__content {
  padding: 16px;
}

.block-preview-large {
  width: 100%;
  height: 60px;
  border-radius: 8px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
}

.block-preview-large::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: var(--kb-surface);
  border-radius: 50%;
  border: 2px solid inherit;
}

.block-preview-large::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: var(--kb-surface);
  border-radius: 50%;
  border: 2px solid inherit;
}

.block-preview-large__content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 600;
}

.block-description {
  font-size: 0.875rem;
  color: var(--kb-text-secondary);
  line-height: 1.4;
  margin: 0;
}
</style>

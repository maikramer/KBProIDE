<template>
  <div class="modern-panel-layout" :class="`modern-panel-layout--${orientation}`">
    <template v-for="(panel, index) in panels" :key="panel.id || index">
      <!-- Panel -->
      <ModernResizablePanel
        :direction="orientation"
        :size="panel.size"
        :min-size="panel.minSize || 100"
        :max-size="panel.maxSize"
        :resizable="panel.resizable !== false && index < panels.length - 1"
        :collapsed="panel.collapsed"
        :storage-key="panel.storageKey"
        @resize="(data) => onPanelResize(index, data)"
        @collapse="() => onPanelCollapse(index)"
        @expand="() => onPanelExpand(index)"
        class="modern-panel-layout__panel"
      >
        <!-- Panel Header (optional) -->
        <div v-if="panel.title || panel.actions" class="modern-panel-layout__header">
          <div class="modern-panel-layout__title">
            <i v-if="panel.icon" class="fa" :class="panel.icon"></i>
            <span>{{ panel.title }}</span>
          </div>
          <div class="modern-panel-layout__actions">
            <!-- Collapse/Expand Button -->
            <button 
              v-if="panel.collapsible"
              class="modern-panel-action"
              @click="togglePanel(index)"
              :title="panel.collapsed ? 'Expandir' : 'Recolher'"
            >
              <i class="fa" :class="panel.collapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
            </button>
            
            <!-- Custom Actions -->
            <button 
              v-for="action in panel.actions" 
              :key="action.id"
              class="modern-panel-action"
              @click="$emit('action', action.id, index)"
              :title="action.title"
            >
              <i class="fa" :class="action.icon"></i>
            </button>
          </div>
        </div>
        
        <!-- Panel Content -->
        <div class="modern-panel-layout__content">
          <component 
            v-if="panel.component && !panel.component.startsWith('.')" 
            :is="panel.component" 
            v-bind="panel.props || {}"
          />
          <async-component 
            v-else-if="panel.component" 
            :target="panel.component"
            :data="panel.props || {}"
          />
          <slot v-else :name="`panel-${index}`" :panel="panel"></slot>
        </div>
      </ModernResizablePanel>
    </template>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import ModernResizablePanel from './ModernResizablePanel.vue';

export default {
  name: 'ModernPanelLayout',
  components: {
    ModernResizablePanel,
    AsyncComponent: defineAsyncComponent(() => import('@/engine/AsyncComponent'))
  },
  props: {
    panels: {
      type: Array,
      required: true
    },
    orientation: {
      type: String,
      default: 'horizontal',
      validator: value => ['horizontal', 'vertical'].includes(value)
    },
    gap: {
      type: Number,
      default: 0
    }
  },
  emits: ['panel-resize', 'panel-collapse', 'panel-expand', 'action'],
  methods: {
    onPanelResize(index, data) {
      this.$emit('panel-resize', { index, ...data });
    },
    
    onPanelCollapse(index) {
      this.$emit('panel-collapse', index);
    },
    
    onPanelExpand(index) {
      this.$emit('panel-expand', index);
    },
    
    togglePanel(index) {
      const panel = this.panels[index];
      if (panel.collapsed) {
        this.onPanelExpand(index);
      } else {
        this.onPanelCollapse(index);
      }
    },
    
    resizePanel(index, size) {
      const panel = this.panels[index];
      if (panel && this.$refs[`panel-${index}`]) {
        this.$refs[`panel-${index}`].setSize(size);
      }
    },
    
    collapsePanel(index) {
      this.onPanelCollapse(index);
    },
    
    expandPanel(index) {
      this.onPanelExpand(index);
    }
  }
}
</script>

<style scoped>
.modern-panel-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.modern-panel-layout--horizontal {
  flex-direction: row;
}

.modern-panel-layout--vertical {
  flex-direction: column;
}

.modern-panel-layout__panel {
  flex-shrink: 0;
}

.modern-panel-layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--kb-surface-3);
  border-bottom: 1px solid var(--kb-border);
  flex-shrink: 0;
}

.modern-panel-layout__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--kb-text-primary);
}

.modern-panel-layout__title i {
  color: var(--kb-primary);
}

.modern-panel-layout__actions {
  display: flex;
  gap: 4px;
}

.modern-panel-action {
  padding: 4px 6px;
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

.modern-panel-action:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text-primary);
}

.modern-panel-layout__content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Panel transitions */
.modern-panel-layout__panel {
  transition: all 0.2s ease;
}

/* Gap support */
.modern-panel-layout--horizontal > .modern-panel-layout__panel:not(:last-child) {
  margin-right: var(--panel-gap, 0);
}

.modern-panel-layout--vertical > .modern-panel-layout__panel:not(:last-child) {
  margin-bottom: var(--panel-gap, 0);
}
</style>

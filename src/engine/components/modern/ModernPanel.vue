<template>
  <div class="modern-panel" :class="{ 'modern-panel--collapsed': collapsed }">
    <div class="modern-panel__header" v-if="showHeader">
      <div class="modern-panel__title">{{ title }}</div>
      <div class="modern-panel__actions">
        <button 
          v-if="collapsible"
          class="modern-btn modern-btn--icon" 
          @click="toggleCollapse"
          :title="collapsed ? 'Expandir' : 'Recolher'"
        >
          <i class="fa" :class="collapsed ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
        </button>
        <button 
          v-if="closable"
          class="modern-btn modern-btn--icon modern-panel__close" 
          @click="$emit('close')"
          title="Fechar"
        >
          <i class="fa fa-times"></i>
        </button>
      </div>
    </div>
    <div class="modern-panel__content" v-if="!collapsed">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModernPanel',
  props: {
    title: {
      type: String,
      default: ''
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    collapsible: {
      type: Boolean,
      default: false
    },
    closable: {
      type: Boolean,
      default: false
    },
    defaultCollapsed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'toggle'],
  data() {
    return {
      collapsed: this.defaultCollapsed
    }
  },
  methods: {
    toggleCollapse() {
      this.collapsed = !this.collapsed;
      this.$emit('toggle', this.collapsed);
    }
  }
}
</script>

<style scoped>
.modern-panel--collapsed {
  height: auto;
}

.modern-panel--collapsed .modern-panel__content {
  display: none;
}

.modern-panel__actions {
  display: flex;
  gap: 4px;
}

.modern-panel__close:hover {
  background: var(--kb-error);
  color: white;
}
</style>

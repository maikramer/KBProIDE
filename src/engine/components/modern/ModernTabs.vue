<template>
  <div class="modern-tabs">
    <div class="modern-tabs__header">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id || index"
        class="modern-tab"
        :class="{ 'modern-tab--active': activeTab === index }"
        @click="setActiveTab(index)"
      >
        <i v-if="tab.icon" class="fa" :class="tab.icon"></i>
        <span>{{ tab.title }}</span>
        <button
          v-if="tab.closable !== false"
          class="modern-tab__close"
          @click.stop="closeTab(index)"
          title="Fechar aba"
        >
          <i class="fa fa-times"></i>
        </button>
      </button>
    </div>
    
    <div class="modern-tabs__content">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.id || index"
        v-show="activeTab === index"
        class="modern-tabs__panel"
      >
        <component 
          v-if="tab.component && !tab.component.startsWith('.')" 
          :is="tab.component" 
          v-bind="tab.props || {}"
        />
        <async-component 
          v-else-if="tab.component" 
          :target="tab.component"
          :data="tab.props || {}"
        />
        <slot v-else :name="`tab-${index}`" :tab="tab"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';

export default {
  name: 'ModernTabs',
  components: {
    AsyncComponent: defineAsyncComponent(() => import('@/engine/AsyncComponent'))
  },
  props: {
    tabs: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:modelValue', 'tab-close', 'tab-change'],
  data() {
    return {
      activeTab: this.modelValue
    }
  },
  watch: {
    modelValue(newVal) {
      this.activeTab = newVal;
    },
    activeTab(newVal) {
      this.$emit('update:modelValue', newVal);
      this.$emit('tab-change', newVal, this.tabs[newVal]);
    }
  },
  methods: {
    setActiveTab(index) {
      this.activeTab = index;
    },
    closeTab(index) {
      this.$emit('tab-close', index, this.tabs[index]);
    }
  }
}
</script>

<style scoped>
.modern-tabs__content {
  flex: 1;
  overflow: hidden;
}

.modern-tabs__panel {
  height: 100%;
  overflow: auto;
}

.modern-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.modern-tabs__header {
  flex-shrink: 0;
}
</style>

<template>
  <div 
    class="modern-resizable-panel"
    :class="[
      `modern-resizable-panel--${direction}`,
      { 'modern-resizable-panel--collapsed': collapsed }
    ]"
    :style="panelStyle"
  >
    <div class="modern-resizable-panel__content">
      <slot></slot>
    </div>
    
    <!-- Resizer -->
    <ModernSplitter
      v-if="resizable && !collapsed"
      :direction="resizerDirection"
      :disabled="!resizable"
      @resize-start="onResizeStart"
      @resize="onResize"
      @resize-end="onResizeEnd"
    />
  </div>
</template>

<script>
import ModernSplitter from './ModernSplitter.vue';

export default {
  name: 'ModernResizablePanel',
  components: { ModernSplitter },
  props: {
    direction: {
      type: String,
      default: 'horizontal',
      validator: value => ['horizontal', 'vertical'].includes(value)
    },
    size: {
      type: [Number, String],
      default: null
    },
    minSize: {
      type: Number,
      default: 100
    },
    maxSize: {
      type: Number,
      default: null
    },
    resizable: {
      type: Boolean,
      default: true
    },
    collapsed: {
      type: Boolean,
      default: false
    },
    storageKey: {
      type: String,
      default: null
    }
  },
  emits: ['resize', 'collapse', 'expand'],
  data() {
    return {
      currentSize: this.size || (this.direction === 'horizontal' ? 300 : 200),
      isResizing: false
    }
  },
  computed: {
    panelStyle() {
      if (this.collapsed) {
        return {
          [this.direction === 'horizontal' ? 'width' : 'height']: '0px',
          overflow: 'hidden'
        };
      }
      
      const sizeProperty = this.direction === 'horizontal' ? 'width' : 'height';
      const size = typeof this.currentSize === 'number' ? `${this.currentSize}px` : this.currentSize;
      
      return {
        [sizeProperty]: size,
        [`min-${sizeProperty}`]: `${this.minSize}px`,
        [`max-${sizeProperty}`]: this.maxSize ? `${this.maxSize}px` : 'none'
      };
    },
    resizerDirection() {
      // Resizer direction is opposite to panel direction
      return this.direction === 'horizontal' ? 'horizontal' : 'vertical';
    }
  },
  watch: {
    size(newSize) {
      if (newSize !== null) {
        this.currentSize = newSize;
      }
    },
    currentSize(newSize) {
      // Save to localStorage if storageKey is provided
      if (this.storageKey) {
        try {
          localStorage.setItem(`panel-size-${this.storageKey}`, String(newSize));
        } catch (e) {
          console.warn('Failed to save panel size:', e);
        }
      }
    }
  },
  methods: {
    onResizeStart() {
      this.isResizing = true;
    },
    
    onResize({ delta }) {
      const newSize = Math.max(
        this.minSize,
        Math.min(
          this.maxSize || Infinity,
          this.currentSize + delta
        )
      );
      
      this.currentSize = newSize;
      this.$emit('resize', {
        size: newSize,
        delta,
        direction: this.direction
      });
    },
    
    onResizeEnd() {
      this.isResizing = false;
    },
    
    collapse() {
      this.$emit('collapse');
    },
    
    expand() {
      this.$emit('expand');
    },
    
    toggle() {
      if (this.collapsed) {
        this.expand();
      } else {
        this.collapse();
      }
    },
    
    setSize(size) {
      this.currentSize = Math.max(
        this.minSize,
        Math.min(this.maxSize || Infinity, size)
      );
    },
    
    loadSavedSize() {
      if (this.storageKey) {
        try {
          const saved = localStorage.getItem(`panel-size-${this.storageKey}`);
          if (saved) {
            this.currentSize = parseInt(saved, 10);
          }
        } catch (e) {
          console.warn('Failed to load saved panel size:', e);
        }
      }
    }
  },
  
  mounted() {
    this.loadSavedSize();
  }
}
</script>

<style scoped>
.modern-resizable-panel {
  display: flex;
  position: relative;
  transition: all 0.2s ease;
  background: var(--kb-surface);
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  overflow: hidden;
}

.modern-resizable-panel--horizontal {
  flex-direction: row;
  min-width: 100px;
}

.modern-resizable-panel--vertical {
  flex-direction: column;
  min-height: 100px;
}

.modern-resizable-panel--collapsed {
  transition: all 0.3s ease;
}

.modern-resizable-panel__content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Panel states */
.modern-resizable-panel--resizing {
  transition: none;
}

.modern-resizable-panel--resizing * {
  pointer-events: none;
  user-select: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modern-resizable-panel {
    min-width: 200px;
    min-height: 150px;
  }
}
</style>

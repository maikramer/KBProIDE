<template>
  <div 
    class="modern-splitter"
    :class="[
      `modern-splitter--${direction}`,
      { 'modern-splitter--resizing': isResizing }
    ]"
    @mousedown="startResize"
    @touchstart="startResize"
  >
    <div class="modern-splitter__handle">
      <div class="modern-splitter__grip">
        <div class="modern-splitter__dot"></div>
        <div class="modern-splitter__dot"></div>
        <div class="modern-splitter__dot"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModernSplitter',
  props: {
    direction: {
      type: String,
      default: 'horizontal',
      validator: value => ['horizontal', 'vertical'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    minSize: {
      type: Number,
      default: 100
    },
    maxSize: {
      type: Number,
      default: null
    }
  },
  emits: ['resize-start', 'resize', 'resize-end'],
  data() {
    return {
      isResizing: false,
      startPosition: 0,
      startSize: 0
    }
  },
  methods: {
    startResize(event) {
      if (this.disabled) return;
      
      event.preventDefault();
      this.isResizing = true;
      
      const clientPos = this.getClientPosition(event);
      this.startPosition = this.direction === 'horizontal' ? clientPos.x : clientPos.y;
      
      this.$emit('resize-start');
      
      // Add global event listeners
      document.addEventListener('mousemove', this.handleResize);
      document.addEventListener('mouseup', this.endResize);
      document.addEventListener('touchmove', this.handleResize);
      document.addEventListener('touchend', this.endResize);
      
      // Prevent text selection during resize
      document.body.style.userSelect = 'none';
      document.body.style.cursor = this.direction === 'horizontal' ? 'col-resize' : 'row-resize';
    },
    
    handleResize(event) {
      if (!this.isResizing) return;
      
      event.preventDefault();
      const clientPos = this.getClientPosition(event);
      const currentPosition = this.direction === 'horizontal' ? clientPos.x : clientPos.y;
      const delta = currentPosition - this.startPosition;
      
      this.$emit('resize', {
        delta,
        direction: this.direction,
        originalEvent: event
      });
    },
    
    endResize() {
      if (!this.isResizing) return;
      
      this.isResizing = false;
      
      // Remove global event listeners
      document.removeEventListener('mousemove', this.handleResize);
      document.removeEventListener('mouseup', this.endResize);
      document.removeEventListener('touchmove', this.handleResize);
      document.removeEventListener('touchend', this.endResize);
      
      // Restore normal cursor and text selection
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      this.$emit('resize-end');
    },
    
    getClientPosition(event) {
      if (event.touches && event.touches.length > 0) {
        return {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      }
      return {
        x: event.clientX,
        y: event.clientY
      };
    }
  },
  
  beforeUnmount() {
    // Cleanup in case component is destroyed during resize
    this.endResize();
  }
}
</script>

<style scoped>
.modern-splitter {
  position: relative;
  background: var(--kb-border);
  transition: background-color 0.2s ease;
  user-select: none;
  z-index: 10;
}

.modern-splitter:hover {
  background: var(--kb-primary);
}

.modern-splitter--resizing {
  background: var(--kb-primary);
}

.modern-splitter--horizontal {
  width: 4px;
  cursor: col-resize;
  min-height: 100%;
}

.modern-splitter--vertical {
  height: 4px;
  cursor: row-resize;
  min-width: 100%;
}

.modern-splitter__handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modern-splitter--horizontal .modern-splitter__handle {
  width: 12px;
  left: -4px;
}

.modern-splitter--vertical .modern-splitter__handle {
  height: 12px;
  top: -4px;
}

.modern-splitter__grip {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.modern-splitter:hover .modern-splitter__grip,
.modern-splitter--resizing .modern-splitter__grip {
  opacity: 1;
}

.modern-splitter--horizontal .modern-splitter__grip {
  flex-direction: column;
  gap: 2px;
}

.modern-splitter--vertical .modern-splitter__grip {
  flex-direction: row;
  gap: 2px;
}

.modern-splitter__dot {
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Disabled state */
.modern-splitter--disabled {
  cursor: default;
  background: var(--kb-border);
}

.modern-splitter--disabled:hover {
  background: var(--kb-border);
}

.modern-splitter--disabled .modern-splitter__grip {
  display: none;
}

/* Touch-friendly sizing for mobile */
@media (max-width: 768px) {
  .modern-splitter--horizontal {
    width: 6px;
  }
  
  .modern-splitter--vertical {
    height: 6px;
  }
  
  .modern-splitter--horizontal .modern-splitter__handle {
    width: 16px;
    left: -5px;
  }
  
  .modern-splitter--vertical .modern-splitter__handle {
    height: 16px;
    top: -5px;
  }
}
</style>

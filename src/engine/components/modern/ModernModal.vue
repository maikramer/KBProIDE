<template>
  <teleport to="body">
    <div 
      v-if="modelValue"
      class="modern-modal-overlay"
      @click.self="onOverlayClick"
    >
      <div 
        class="modern-modal"
        :class="[
          `modern-modal--${size}`,
          { 'modern-modal--fullscreen': fullscreen }
        ]"
        @click.stop
      >
        <!-- Header -->
        <div class="modern-modal__header">
          <div class="modern-modal__title">
            <i v-if="icon" class="fa" :class="icon"></i>
            <span>{{ title }}</span>
          </div>
          <div class="modern-modal__actions">
            <button 
              v-if="!persistent"
              class="modern-modal__close"
              @click="close"
              title="Fechar"
            >
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="modern-modal__content">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="modern-modal__footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  name: 'ModernModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large', 'extra-large'].includes(value)
    },
    persistent: {
      type: Boolean,
      default: false
    },
    fullscreen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'close'],
  methods: {
    close() {
      this.$emit('update:modelValue', false);
      this.$emit('close');
    },
    onOverlayClick() {
      if (!this.persistent) {
        this.close();
      }
    }
  },
  mounted() {
    // Prevent body scroll when modal is open
    if (this.modelValue) {
      document.body.style.overflow = 'hidden';
    }
  },
  beforeUnmount() {
    // Restore body scroll
    document.body.style.overflow = '';
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
}
</script>

<style scoped>
.modern-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modern-modal {
  background: var(--kb-surface-2);
  border-radius: var(--kb-radius-lg);
  border: 1px solid var(--kb-border);
  box-shadow: var(--kb-shadow-lg);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modern-modal--small {
  width: 400px;
  max-width: 90vw;
}

.modern-modal--medium {
  width: 600px;
  max-width: 90vw;
}

.modern-modal--large {
  width: 800px;
  max-width: 95vw;
}

.modern-modal--extra-large {
  width: 1200px;
  max-width: 95vw;
}

.modern-modal--fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  border-radius: 0;
  margin: 0;
}

.modern-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: var(--kb-surface-3);
  border-bottom: 1px solid var(--kb-border);
  border-radius: var(--kb-radius-lg) var(--kb-radius-lg) 0 0;
  flex-shrink: 0;
}

.modern-modal__title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--kb-text-primary);
}

.modern-modal__title i {
  color: var(--kb-primary);
}

.modern-modal__actions {
  display: flex;
  gap: 8px;
}

.modern-modal__close {
  padding: 8px;
  background: none;
  border: none;
  color: var(--kb-text-muted);
  cursor: pointer;
  border-radius: var(--kb-radius);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.modern-modal__close:hover {
  background: var(--kb-error);
  color: white;
}

.modern-modal__content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.modern-modal__footer {
  padding: 16px 24px;
  background: var(--kb-surface-3);
  border-top: 1px solid var(--kb-border);
  border-radius: 0 0 var(--kb-radius-lg) var(--kb-radius-lg);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .modern-modal-overlay {
    padding: 10px;
  }
  
  .modern-modal--small,
  .modern-modal--medium,
  .modern-modal--large,
  .modern-modal--extra-large {
    width: 100%;
    max-width: 100%;
    max-height: 100%;
  }
  
  .modern-modal__header {
    padding: 16px 20px;
  }
  
  .modern-modal__content {
    padding: 20px;
  }
  
  .modern-modal__footer {
    padding: 12px 20px;
  }
}
</style>

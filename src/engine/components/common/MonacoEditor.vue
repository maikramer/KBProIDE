<template>
  <div 
    ref="editorContainer" 
    class="monaco-editor-container"
    :style="{ height: height, width: width }"
  ></div>
</template>

<script>
export default {
  name: 'MonacoEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'cpp'
    },
    theme: {
      type: String,
      default: 'vs-dark'
    },
    options: {
      type: Object,
      default: () => ({})
    },
    height: {
      type: String,
      default: '100%'
    },
    width: {
      type: String,
      default: '100%'
    }
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
  data() {
    return {
      editor: null,
      isMonacoLoaded: false
    }
  },
  computed: {
    editorOptions() {
      return {
        value: this.modelValue,
        language: this.language,
        theme: this.theme,
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        folding: true,
        renderLineHighlight: 'all',
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        ...this.options
      }
    }
  },
  watch: {
    modelValue(newValue) {
      if (this.editor && this.editor.getValue() !== newValue) {
        this.editor.setValue(newValue || '');
      }
    },
    language(newLanguage) {
      if (this.editor) {
        const model = this.editor.getModel();
        if (model && window.monaco) {
          window.monaco.editor.setModelLanguage(model, newLanguage);
        }
      }
    },
    theme(newTheme) {
      if (this.editor && window.monaco) {
        window.monaco.editor.setTheme(newTheme);
      }
    },
    options: {
      handler(newOptions) {
        if (this.editor) {
          this.editor.updateOptions(newOptions);
        }
      },
      deep: true
    }
  },
  async mounted() {
    await this.loadMonaco();
    this.initEditor();
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.dispose();
    }
  },
  methods: {
    async loadMonaco() {
      // Check if Monaco is already loaded
      if (window.monaco) {
        this.isMonacoLoaded = true;
        return;
      }

      try {
        // Try to load Monaco from CDN
        await this.loadMonacoFromCDN();
        this.isMonacoLoaded = true;
      } catch (error) {
        console.warn('Monaco Editor not available, using fallback textarea');
        this.createFallbackEditor();
      }
    },
    createFallbackEditor() {
      // Create a simple textarea fallback when Monaco is not available
      const textarea = document.createElement('textarea');
      textarea.value = this.modelValue || '';
      textarea.style.width = '100%';
      textarea.style.height = '100%';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.resize = 'none';
      textarea.style.fontFamily = 'Monaco, Consolas, "Courier New", monospace';
      textarea.style.fontSize = '14px';
      textarea.style.padding = '12px';
      textarea.style.backgroundColor = this.theme === 'vs-dark' ? '#0f172a' : '#ffffff';
      textarea.style.color = this.theme === 'vs-dark' ? '#e2e8f0' : '#000000';
      textarea.style.lineHeight = '1.6';
      textarea.style.tabSize = '2';
      textarea.style.borderRadius = '6px';
      textarea.style.boxSizing = 'border-box';

      // Add event listeners
      textarea.addEventListener('input', (e) => {
        this.$emit('update:modelValue', e.target.value);
        this.$emit('change', e.target.value);
      });

      textarea.addEventListener('focus', () => {
        this.$emit('focus');
      });

      textarea.addEventListener('blur', () => {
        this.$emit('blur');
      });

      // Clear container and add textarea
      this.$refs.editorContainer.innerHTML = '';
      this.$refs.editorContainer.appendChild(textarea);

      // Store reference for cleanup
      this.editor = {
        getValue: () => textarea.value,
        setValue: (value) => { textarea.value = value; },
        dispose: () => { textarea.remove(); },
        updateOptions: () => {},
        getModel: () => null
      };
    },
    initEditor() {
      if (!window.monaco) {
        return; // Fallback editor already created
      }

      try {
        // Create Monaco editor instance
        this.editor = window.monaco.editor.create(this.$refs.editorContainer, this.editorOptions);

        // Add event listeners
        this.editor.onDidChangeModelContent(() => {
          const value = this.editor.getValue();
          this.$emit('update:modelValue', value);
          this.$emit('change', value);
        });

        this.editor.onDidFocusEditorText(() => {
          this.$emit('focus');
        });

        this.editor.onDidBlurEditorText(() => {
          this.$emit('blur');
        });

        this.isMonacoLoaded = true;
      } catch (error) {
        console.error('Failed to initialize Monaco Editor:', error);
        this.createFallbackEditor();
      }
    },
    focus() {
      if (this.editor && this.editor.focus) {
        this.editor.focus();
      }
    },
    blur() {
      if (this.editor && this.editor.blur) {
        this.editor.blur();
      }
    },
    getEditor() {
      return this.editor;
    },
    async loadMonacoFromCDN() {
      return new Promise((resolve, reject) => {
        if (window.monaco) {
          resolve(window.monaco);
          return;
        }

        // Load Monaco Editor from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs/loader.min.js';
        script.onload = () => {
          window.require.config({ 
            paths: { 
              vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' 
            } 
          });
          
          window.require(['vs/editor/editor.main'], () => {
            window.monaco = window.monaco || {};
            resolve(window.monaco);
          });
        };
        script.onerror = () => {
          reject(new Error('Failed to load Monaco Editor from CDN'));
        };
        
        document.head.appendChild(script);
      });
    },
    resize() {
      if (this.editor && this.editor.layout) {
        this.editor.layout();
      }
    }
  }
}
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
  border: 1px solid var(--kb-border);
  border-radius: var(--kb-radius);
  overflow: hidden;
  background: var(--kb-surface);
}

/* Fallback textarea styles */
.monaco-editor-container textarea {
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  tab-size: 2;
  -moz-tab-size: 2;
}

/* Dark theme adjustments */
.monaco-editor-container.theme-dark {
  background: #1e1e1e;
  color: #d4d4d4;
}

.monaco-editor-container.theme-light {
  background: #ffffff;
  color: #000000;
}
</style>

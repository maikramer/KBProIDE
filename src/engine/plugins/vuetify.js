import { h } from 'vue';

export default {
  install(app) {
    if (!app.config.globalProperties.$vuetify) {
      app.config.globalProperties.$vuetify = { theme: { primary: '#009688' }, dark: false };
    }
    const registerStub = (name) => {
      try {
        // Check if component is already registered
        if (app._context.components && app._context.components[name]) { 
          console.warn(`Component ${name} already registered, skipping`);
          return; 
        }
        if (name === 'v-tooltip' || name === 'v-menu') {
          app.component(name, {
            name,
            props: ['value','modelValue'],
            emits: ['input','update:modelValue'],
            template: '<div><slot name="activator"></slot><div style="display:none"><slot/></div></div>'
          });
          return;
        }
        // Special handling for v-dialog to prevent rendering when modelValue is false
        if (name === 'v-dialog') {
          app.component(name, {
            name,
            props: ['value','modelValue', 'persistent', 'maxWidth'],
            emits: ['input','update:modelValue'],
            template: '<div v-if="modelValue || value" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; background: rgba(0,0,0,0.5); width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;"><div style="background: var(--kb-surface-2); border-radius: 8px; border: 1px solid var(--kb-border); max-width: 90vw; max-height: 90vh; overflow: auto;"><slot/></div></div>'
          });
          return;
        }
        
        app.component(name, {
          name,
          props: ['value','modelValue'],
          emits: ['input','update:modelValue'],
          template: '<div><slot/></div>'
        });
      } catch (e) {
        console.warn(`Failed to register component ${name}:`, e);
      }
    };
    [
      'v-app','v-content','v-navigation-drawer','v-divider','v-spacer',
      'v-btn','v-tooltip','v-responsive',
      'v-card','v-card-title','v-card-text','v-card-actions','v-dialog',
      'v-toolbar','v-toolbar-title','v-toolbar-side-icon','v-footer',
      'v-list','v-list-group','v-list-tile','v-list-tile-content','v-list-tile-title','v-list-tile-avatar','v-list-tile-action','v-list-tile-sub-title','v-subheader',
      'v-img','v-progress-circular','v-progress-linear',
      'v-tabs','v-tab','v-tab-item',
      'v-text-field','v-textarea','v-combobox','v-menu','v-avatar',
      'v-snackbar',
      'v-container','v-layout','v-flex',
      'v-expansion-panel','v-expansion-panel-content',
      'v-item-group','v-item','v-chip',
      'v-tour',
      'multipane','multipane-resizer',
      'piano-dialog','t-t-s-dialog',
      'MonacoEditor',
      'xml','category','block',
      'smooth-scrollbar',
    ].forEach(registerStub);

    // v-icon specialized stub (Vue 3): render class name inside <i>
    try {
      if (!app._context.components['v-icon']) {
        app.component('v-icon', {
          name: 'v-icon',
          props: ['dark'],
          setup(_props, { slots }){
            return () => {
              const vnode = slots.default ? slots.default()[0] : null;
              const text = vnode && typeof vnode.children === 'string' ? vnode.children : '';
              const cls = (text || '').toString().trim();
              return h('i', { class: cls || 'fa' });
            };
          }
        });
      }
    } catch(e) {}

    // v-tooltip / v-menu specialized stub: expose activator slot with { on:{} } and hide default
    try {
      const makeOverlay = (name) => ({
        name,
        props: ['value','modelValue'],
        emits: ['input','update:modelValue'],
        setup(_p, { slots }){
          return () => h('div', [
            slots.activator ? slots.activator({ on: {} }) : null,
            h('div', { style: 'display:none' }, slots.default ? slots.default() : [])
          ]);
        }
      });
      
      // Only register if not already registered
      if (!app._context.components['v-tooltip']) {
        app.component('v-tooltip', makeOverlay('v-tooltip'));
      }
      if (!app._context.components['v-menu']) {
        app.component('v-menu', makeOverlay('v-menu'));
      }
    } catch(e) {}

    // v-hover stub: provide { hover:false } into default slot
    try {
      app.component('v-hover', {
        name: 'v-hover',
        setup(_p, { slots }){ return () => (slots.default ? slots.default({ hover: false }) : h('div')); }
      });
    } catch(e) {}

    // v-toolbar-title specialized stub: ensure it doesn't render promises
    try {
      if (!app._context.components['v-toolbar-title']) {
        app.component('v-toolbar-title', {
          name: 'v-toolbar-title',
          setup(_p, { slots }){
            return () => {
              if (!slots.default) return h('div', { class: 'v-toolbar-title' });
              try {
                const content = slots.default();
                // Filter out Promise objects or other non-renderable content
                if (content && typeof content === 'object' && !Array.isArray(content) && !content.type && !content.children) {
                  return h('div', { class: 'v-toolbar-title' });
                }
                return h('div', { class: 'v-toolbar-title' }, content);
              } catch (e) {
                return h('div', { class: 'v-toolbar-title' });
              }
            };
          }
        });
      }
    } catch(e) {}
    
    // v-toolbar-side-icon stub: render as button with menu icon
    try {
      if (!app._context.components['v-toolbar-side-icon']) {
        app.component('v-toolbar-side-icon', {
          name: 'v-toolbar-side-icon',
          emits: ['click'],
          setup(_p, { emit }){
            return () => h('button', { 
              class: 'v-toolbar-side-icon',
              onClick: () => emit('click')
            }, [
              h('i', { class: 'fa fa-bars' })
            ]);
          }
        });
      }
    } catch(e) {}
  }
};

export default {
  install(app) {
    if (!app.config.globalProperties.$vuetify) {
      app.config.globalProperties.$vuetify = { theme: { primary: '#009688' }, dark: false };
    }
    const registerStub = (name) => {
      try {
        if (app._context.components && app._context.components[name]) { return; }
        app.component(name, {
          name,
          props: ['value','modelValue'],
          emits: ['input','update:modelValue'],
          template: '<div><slot/></div>'
        });
      } catch (e) {}
    };
    [
      'v-app','v-content','v-navigation-drawer','v-divider','v-spacer',
      'v-btn','v-icon','v-tooltip','v-hover','v-responsive',
      'v-card','v-card-title','v-card-text','v-card-actions','v-dialog',
      'v-toolbar','v-toolbar-title','v-toolbar-side-icon','v-footer',
      'v-list','v-list-group','v-list-tile','v-list-tile-content','v-list-tile-title','v-list-tile-avatar','v-list-tile-action','v-list-tile-sub-title','v-subheader',
      'v-img','v-progress-circular','v-progress-linear',
      'v-tabs','v-tab','v-tab-item',
      'v-text-field','v-textarea','v-combobox','v-menu',
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
  }
};

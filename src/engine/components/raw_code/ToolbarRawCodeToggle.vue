<template>
    <div v-if="$global.setting.devMode === true">
        <div class="container-raw-code" v-if="$global.editor.mode === 2">
            <span class="f-manjari-b text-white">RAW CODE</span>
            <label class="text-white" style="display:flex;align-items:center;gap:6px">
              <input type="checkbox" v-model="$global.editor.rawCodeMode"/>
              <span>{{ $global.editor.rawCodeMode ? 'ON' : 'OFF' }}</span>
            </label>
        </div>
    </div>
    </template>

<script>
  // Replace legacy vue-js-toggle-button with a native checkbox for Vue 3
  export default {
    name: "RawCodeToggle",
    components: {},
  };
</script>

<style scoped>
    .container-raw-code {
        display: flex !important;
        flex-direction: column !important;
        padding: 0 10px 5px 10px;
        /*background-color: rgba(255, 255, 255, 0.8);*/
        border-radius: 6px;
        align-items: center;
        margin-left: 5px;
    }
    .text-dark {
        color: #2e2e2e;
    }
    .text-white {
        color: white;
    }
</style>
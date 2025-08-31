<template>
    <v-tooltip bottom>
        <v-btn color="primary darken-2"
               slot="activator"
               icon
               class="!text-gray-200 hover:!text-white"
               @click="$global.ui.rightDrawer('./components/setting/RightDrawer')"
        >
            <v-icon dark>fa-gear</v-icon>
        </v-btn>
        <span>Setting</span>
    </v-tooltip>
</template>
<script>
const isElectron = typeof process !== 'undefined' && process.versions && !!process.versions.electron;
let electron = null;
try { if (isElectron) { electron = require('electron'); } } catch(e) { electron = null; }
export default {
    created(){
        if (electron && electron.ipcRenderer) {
            electron.ipcRenderer.on('file-setting',()=>{ this.$global.ui.rightDrawer('./components/setting/RightDrawer'); });
        }
    }
}
</script>


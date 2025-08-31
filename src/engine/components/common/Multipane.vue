<template>
  <div :class="['multipane', layoutClass]" @mouseleave="onLeave">
    <slot />
  </div>
  
</template>

<script>
export default {
  name: 'Multipane',
  props: {
    layout: { type: String, default: 'horizontal' },
    fillHeight: { type: Boolean, default: false }
  },
  computed: {
    layoutClass(){ return this.layout === 'vertical' ? 'layout-v' : 'layout-h'; }
  },
  methods: {
    onLeave(){ /* noop - placeholder for parity */ }
  }
}
</script>

<style scoped>
.multipane {
  display: flex;
  width: 100%;
  height: 100%;
}
.layout-h { flex-direction: row; }
.layout-v { flex-direction: column; }
</style>



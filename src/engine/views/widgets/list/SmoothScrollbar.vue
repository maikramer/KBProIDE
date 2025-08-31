<template>
  <div ref="scrollArea" class="smooth-scrollbar">
    <slot/>
  </div>
</template>

<script>
  export default {
    name: 'smooth-scrollbar',
    props: { options: { type: Object, required: false, default: () => ({}) } },
    mounted() {
      const el = /** @type {HTMLElement|null} */ (this.$refs.scrollArea);
      if (!el) return;
      // eslint-disable-next-line
      el.style.overflow = 'auto';
      // eslint-disable-next-line
      el.style.setProperty('-webkit-overflow-scrolling', 'touch');
      // Provide a minimal API compatible with old code expecting .scrollbar.addListener/removeListener
      // We attach a simple listener for the native scroll event.
      const self = this;
      const api = {
        addListener(handler) { try { el.addEventListener('scroll', handler); } catch(e) {} },
        removeListener(handler) { try { el.removeEventListener('scroll', handler); } catch(e) {} },
      };
      // Expose via this.$refs.scrollbar.scrollbar
      this.scrollbar = api;
      // Also keep backward compatible shape: this.$refs.scrollbar.scrollbar
      // by setting a proxy object on the component instance reference itself
      // (the parent uses this.$refs.scrollbar, which is the component instance)
      // so we assign a property named 'scrollbar'.
    }
  }
</script>

<style scoped>
.smooth-scrollbar {
  width: 100%;
  height: 100%;
}
</style>
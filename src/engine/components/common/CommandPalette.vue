<template>
  <div v-if="modelValue" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/50" @click="$emit('update:modelValue', false)"></div>
    <div class="relative mx-auto mt-24 w-full max-w-xl rounded-xl bg-[#0f172a] text-gray-200 shadow-2xl ring-1 ring-white/10">
      <div class="p-3 border-b border-white/10">
        <input
          ref="input"
          v-model="query"
          type="text"
          placeholder="Digite um comando... (Esc para fechar)"
          class="w-full bg-transparent outline-none text-sm placeholder-gray-400"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="runSelected"
          @keydown.esc.prevent="$emit('update:modelValue', false)"
        />
      </div>
      <ul class="max-h-72 overflow-y-auto p-1">
        <li
          v-for="(a,i) in filtered"
          :key="a.name"
          class="px-3 py-2 rounded-md cursor-pointer text-sm"
          :class="i===index ? 'bg-white/10' : 'hover:bg-white/5'"
          @mouseenter="index=i"
          @click="run(a)"
        >
          {{ a.name }}
        </li>
        <li v-if="filtered.length===0" class="px-3 py-3 text-sm text-gray-400">Sem resultados</li>
      </ul>
    </div>
  </div>
  </template>
<script>
export default {
  name: 'CommandPalette',
  props: {
    modelValue: { type: Boolean, default: false },
    actions: { type: Array, default: () => [] }
  },
  data(){
    return { query: '', index: 0 };
  },
  computed: {
    filtered(){
      if (!this.query) return this.actions;
      const q = this.query.toLowerCase();
      return this.actions.filter(a => a.name.toLowerCase().includes(q));
    }
  },
  watch: {
    modelValue(val){
      if (val) {
        this.$nextTick(()=> this.$refs.input && this.$refs.input.focus());
      } else {
        this.query=''; this.index=0;
      }
    }
  },
  methods: {
    move(step){
      if (this.filtered.length===0) return;
      this.index = (this.index + step + this.filtered.length) % this.filtered.length;
    },
    runSelected(){
      const a = this.filtered[this.index];
      if (a) this.run(a);
    },
    run(a){
      try { a && typeof a.run==='function' && a.run(); } catch(e) {}
      this.$emit('run', a);
      this.$emit('update:modelValue', false);
    }
  }
};
 </script>
<style scoped>
</style>


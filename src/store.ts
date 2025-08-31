import { createStore } from "vuex";

export default createStore({
  state: {
  	rawCode: {
  		mode: false,
  		rollbackMode: 0,
  		display: false,
  	}
  },
  mutations: {
  	rawCodeMode(state, data) {
    	state.rawCode.mode = data;
    },
    rollbackRawCode(state, data) {
    	state.rawCode.rollbackMode = data;
    },
    rawCodeToggleDisplay(state, data) {
    	state.rawCode.display = data;
    }
  },
  actions: {
  	rawCodeMode(context, data) {
    	context.commit('rawCodeMode', data);
    },
    rollbackRawCode(context, data) {
    	context.commit('rollbackRawCode', data);
    },
    rawCodeToggleDisplay(context, data) {
    	context.commit('rawCodeToggleDisplay', data);
    },
  }
});

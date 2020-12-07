import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    draw_place_stack: []
  },
  mutations: {
    save_drawplace(state, drawplace) {
      state.draw_place_stack[0] = drawplace
    }
  },
  getters: {
    getDrawplaceStack: (state) => {
      return state.draw_place_stack
    }
  },
  actions: {
    submit_to_sharedb(context, payload) {
      console.log(payload.connection.get('drawings', '0'))
      payload.connection.get('drawings', '0').submitOp([{p: ['canvas'], oi: payload.canvas}], (err) => {
        if (err)
          console.log('Submitting failed: ', err);
        else
          console.log('SUBMIT_TO_SHAREDB');
      });
    },
    update_from_sharedb(context, query) {
      console.log('UPDATE_FROM_SHAREDB');
      context.commit('save_drawplace', {title:'FUCKAIDS', canvas: query.get('drawings', '0').data.canvas})
    }
  },
  modules: {
  }
})

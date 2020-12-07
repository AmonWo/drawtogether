import Vue from 'vue'
import Vuex from 'vuex'
import connection from "../plugins/sharedb_client";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    draw_place_stack: []
  },
  mutations: {
    save_drawplace(state, drawplace) {
      state.draw_place_stack[0] = drawplace
      console.log(state.draw_place_stack[0])
    }
  },
  actions: {
    submit_to_sharedb(context, newCanvas) {
      console.log(connection);
      connection.get('drawings', '0').submitOp([{p: ['canvas'], oi: newCanvas}]);
      console.log('SUBMIT_TO_SHAREDB:\n', newCanvas)
    },
    update_from_sharedb(context, query) {
      console.log('UPDATE_FROM_SHAREDB');
      context.commit('save_drawplace', {title:'FUCKAIDS', canvas: query.results[0].data.canvas})
    }
  },
  modules: {
  }
})

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    draw_place_stack: []
  },
  mutations: {
    save_drawplace(state, drawplace) {
      state.draw_place_stack.push(drawplace)
    }
  },
  actions: {
  },
  modules: {
  }
})

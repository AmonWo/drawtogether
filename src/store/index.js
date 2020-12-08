import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        draw_place_stack: []
    },
    mutations: {
        save_drawplace(state, drawplace) {
            state.draw_place_stack = drawplace
        }
    },
    getters: {
        getDrawplaceStack: (state) => {
            return state.draw_place_stack
        }
    },
    actions: {
        submit_to_sharedb(context, payload) {
            console.log('SUBMIT: ', payload.canvas.length)
            //payload.connection.get('drawings', '0').submitOp([{p: ['canvas'], oi: payload.canvas}], (err) => {
            let curr_array = payload.connection.get('drawings', payload.drawplaceName).data.canvas
            curr_array.push(payload.canvas)
            payload.doc.submitOp([{p: ['canvas'], oi: curr_array}], (err) => {
                if (err) {
                    console.log('Submitting failed:\n', err);
                    console.log('PAYLOAD: ', payload.canvas.length)
                    //console.log('ANSWER: ', payload.connection.get('drawings', '0').data.canvas.length)

                } else {
                    console.log('SUBMIT_TO_SHAREDB: ', payload.canvas.length);
                    //console.log('GOT_FROM_SHAREDB: ', payload.connection.get('drawings', '0').data.canvas)
                }
            });
        },
        update_from_sharedb(context, payload) {
            console.log('UPDATE_FROM_SHAREDB: ', payload.connection.get('drawings', payload.drawplaceName).data.canvas.length);
            //context.commit('save_drawplace', {title: 'FUCKAIDS', canvas: query.get('drawings', '0').data.canvas})
            context.commit('save_drawplace', payload.connection.get('drawings', payload.drawplaceName).data.canvas)
        }
    },
    modules: {}
})

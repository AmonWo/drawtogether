import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        drawplace: {
            paths: [],
            shapes: []
        }
    },
    mutations: {
        save_drawplace(state, payload) {
            state.drawplace.paths = payload.paths;
            state.drawplace.shapes = payload.shapes;
        },
        delete_shape: (state, index) => {
            state.drawplace.shapes.splice(index, 1)
        },
        clear_drawplace: (state) => {
            state.drawplace.paths = []
            state.drawplace.shapes = []
        }
    },
    getters: {
        getDrawplace: (state) => {
            return state.drawplace
        }
    },
    actions: {
        submit_to_sharedb(context, payload) {
            let curr_array = payload.connection.get('drawings', payload.drawplaceName).data.paths;
            curr_array.push(payload.paths);
            payload.doc.submitOp([{p: ['paths'], oi: curr_array}], (err) => {
                if (err) {
                    console.log('Submitting failed:\n', err);
                } else {
                    console.log('SUBMIT_TO_SHAREDB: ', payload.paths.length);
                }
            });
            if (payload.shapes !== null) {
                console.log('SUBMIT SHAPES COMP:', payload.shapes, payload.connection.get('drawings', payload.drawplaceName).data.shapes);
                let curr_shapes = payload.connection.get('drawings', payload.drawplaceName).data.shapes;
                curr_shapes.push(payload.shapes);
                payload.doc.submitOp([{p: ['shapes'], oi: curr_shapes}], (err) => {
                    if (err) {
                        console.log('Submitting failed:\n', err);
                        console.log('PAYLOAD: ', payload.paths.length)
                    } else {
                        console.log('SUBMIT_TO_SHAREDB: ', payload.paths.length);
                    }
                });
            }
        },
        update_from_sharedb(context, payload) {
            if (payload.connection.get('drawings', payload.drawplaceName).data !== undefined) {
                console.log('UPDATE_FROM_SHAREDB: ', payload.connection.get('drawings', payload.drawplaceName).data.paths.length);
                let newData = payload.connection.get('drawings', payload.drawplaceName).data
                let newPayload = {
                    paths: newData.paths,
                    shapes: newData.shapes
                };
                context.commit('save_drawplace', newPayload)
            }
        },
        delete_from_sharedb(context, payload) {
            payload.doc.submitOp([{p: ['shapes', payload.index], ld: payload.index}], (err) => {
                if (err) {
                    console.log('Submitting failed:\n', err);
                    console.log('PAYLOAD: ', payload)
                } else {
                    console.log('SUBMIT_TO_SHAREDB: ', payload);
                }
            });
        },
        clear_drawplace(context, payload) {
            payload.doc.del()
            context.commit('clear_drawplace')
        }
    },
    modules: {}
})

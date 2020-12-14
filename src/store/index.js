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
        }
    },
    getters: {
        getDrawplace: (state) => {
            return state.drawplace
        }
    },
    setters: {
        deleteShape: (state, index) => {
            state.drawplace.shapes.splice(index, 1)
        }
    },
    actions: {
        submit_to_sharedb(context, payload) {
            //console.log('SUBMIT: ', payload.drawplace.length)
            //payload.connection.get('drawings', '0').submitOp([{p: ['canvas'], oi: payload.canvas}], (err) => {
            let curr_array = payload.connection.get('drawings', payload.drawplaceName).data.paths;
            curr_array.push(payload.paths);
            payload.doc.submitOp([{p: ['paths'], oi: curr_array}], (err) => {
                if (err) {
                    console.log('Submitting failed:\n', err);
                    console.log('PAYLOAD: ', payload.paths.length)
                    //console.log('ANSWER: ', payload.connection.get('drawings', '0').data.canvas.length)

                } else {
                    console.log('SUBMIT_TO_SHAREDB: ', payload.paths.length);
                    //console.log('GOT_FROM_SHAREDB: ', payload.connection.get('drawings', '0').data.canvas)
                }
            });
            if (payload.shapes !== payload.connection.get('drawings', payload.drawplaceName).data.shapes){
                console.log('SUBMIT SHAPES COMP:', payload.shapes, payload.connection.get('drawings', payload.drawplaceName).data.shapes);
                let curr_shapes = payload.connection.get('drawings', payload.drawplaceName).data.shapes;
                curr_shapes.push(payload.shapes);
                payload.doc.submitOp([{p: ['shapes'], oi: curr_shapes}], (err) => {
                    if (err) {
                        console.log('Submitting failed:\n', err);
                        console.log('PAYLOAD: ', payload.paths.length)
                        //console.log('ANSWER: ', payload.connection.get('drawings', '0').data.canvas.length)

                    } else {
                        console.log('SUBMIT_TO_SHAREDB: ', payload.paths.length);
                        //console.log('GOT_FROM_SHAREDB: ', payload.connection.get('drawings', '0').data.canvas)
                    }
                });
            }
        },
        update_from_sharedb(context, payload) {
            console.log('UPDATE_FROM_SHAREDB: ', payload.connection.get('drawings', payload.drawplaceName).data.paths.length);
            //context.commit('save_drawplace', {title: 'FUCKAIDS', canvas: query.get('drawings', '0').data.canvas})
            let newData = payload.connection.get('drawings', payload.drawplaceName).data
            let newPayload = {
                paths: newData.paths,
                shapes: newData.shapes
            };
            context.commit('save_drawplace', newPayload)
        }
    },
    modules: {}
})

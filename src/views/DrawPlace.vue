<template>
    <div id="draw-space" class="draw-space col-12 pb-10" :tool="tool">
        <canvas id="draw-canvas" style="border: 2px solid white"></canvas>
        <v-dialog v-model="dialog"
                  max-width="290"
        >      <v-card>
            <v-card-title class="headline">
                Name des Drawplace
            </v-card-title>
            <v-text-field
                    class="pa-10"
                    label="Name"
                    placeholder="Gib einen Namen ein"
                    v-model="title"
            ></v-text-field>
            <v-card-actions>
                <v-btn
                        color="green darken-1"
                        text
                        @click="this.save_drawplace"
                        @keypress="this.save_drawplace"
                        width="100%"
                >
                    Speichern
                </v-btn>
            </v-card-actions>
        </v-card>

        </v-dialog>
    </div>
</template>

<script>
    import {EventBus} from '../plugins/eventbus'
    import connection from "../plugins/sharedb_client";

    export default {
        name: "DrawPlace",
        props: {
            brushColor: String,
            alpha: Number,
            brushSize: {
                type: Number,
                default: 5
            },
            tool: String,
        },
        computed: {
            draw_place_stack: function () {
                return this.$store.state.draw_place_stack
            }
        },
        data() {
            return {
                prevX: 0,
                currX: 0,
                prevY: 0,
                currY: 0,
                flag: false,
                dot_flag: false,
                canvas: null,
                ctx: null,
                drawingSpace: null,
                dialog: false,
                title: "",
                query: null,
                doc: null,
            }
        },
        methods: {
            create_canvas() {
                this.canvas = document.getElementById('draw-canvas');
                this.drawingSpace = document.getElementById('draw-space');
                this.ctx = this.canvas.getContext('2d');
                this.canvas.height = this.drawingSpace.clientHeight - 100;
                this.canvas.width = this.drawingSpace.clientWidth - 335;
            },
            save_drawplace() {
                const data = this.canvas.toDataURL('image/png');
                this.$store.commit('save_drawplace', {
                    title: this.title,
                    canvas: data,
                });
                this.show_dialog();
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            },
            submit_to_sharedb() {
                let payload = {
                    canvas: this.canvas.toDataURL('image/png'),
                    connection: connection,
                    doc: this.doc
                };
                this.$store.dispatch('submit_to_sharedb', payload)
            },
            show_dialog() {
              this.dialog = !this.dialog
            },
            draw() {
                this.ctx.beginPath();
                if (this.tool === 'pencil') {
                    this.ctx.globalCompositeOperation = 'source-over'
                } else if (this.tool === 'eraser') {
                    this.ctx.globalCompositeOperation = 'destination-out'
                }
                this.ctx.lineWidth = this.brushSize;
                this.ctx.moveTo(this.prevX, this.prevY);
                this.ctx.lineTo(this.currX, this.currY);
                this.ctx.strokeStyle = this.brushColor;
                this.ctx.fillStyle = this.brushColor;
                this.ctx.globalAlpha = this.alpha / 100;
                this.ctx.arc(this.currX, this.currY, this.brushSize, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.fill();
                this.ctx.closePath();

            },
            find_mouse_pos(res, e) {
                if (res === 'down') {
                    this.prevX = this.currX;
                    this.prevY = this.currY;
                    this.currX = (e.clientX - this.canvas.offsetLeft) - 50;
                    this.currY = (e.clientY - this.canvas.offsetTop) - 90;

                    this.flag = true;
                    this.dot_flag = true;
                        if (this.dot_flag) {
                            this.ctx.beginPath();
                            this.ctx.fillStyle = this.brushColor;
                            this.ctx.globalAlpha = this.alpha / 100;
                            this.ctx.fillRect(this.currX, this.currY, this.brushSize, this.brushSize);
                            this.ctx.closePath();
                            this.dot_flag = false
                        }
                }
                if (res === 'up' || res === 'out') {
                    this.flag = false;
                }
                if (res === 'move') {
                    if (this.flag) {
                        this.prevX = this.currX;
                        this.prevY = this.currY;
                        this.currX = (e.clientX - this.canvas.offsetLeft) - 50;
                        this.currY = (e.clientY - this.canvas.offsetTop) - 90;
                        this.draw()
                    }
                }
            },
            add_eventlistners() {
                this.canvas.addEventListener("mousemove", (e) => {
                    this.find_mouse_pos('move', e)
                });

                this.canvas.addEventListener('mousedown', (e) => {
                    this.find_mouse_pos('down', e)
                });

                this.canvas.addEventListener('mouseup', (e) => {
                    this.find_mouse_pos('up', e);
                    this.submit_to_sharedb()
                });

                this.canvas.addEventListener('mouseout', (e) => {
                    this.find_mouse_pos('out', e)
                });
            },
            start_listening_eventbus(){
                EventBus.$on('load_drawplace', (drawplace) => {
                    "use strict";
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    var img = new window.Image();
                    img.addEventListener("load", () => {
                        this.canvas.getContext("2d").drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                    });
                    img.setAttribute("src", drawplace.canvas);
                });

                EventBus.$on('show_dialog', () => {
                    this.show_dialog()
                })
            },
            draw_updated_canvas() {
                console.log('DRAW UPDATED CANVAS')
                let drawplace = this.$store.getters.getDrawplaceStack;
                console.log('drawplace: ', drawplace);
                //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                var img = new window.Image();
                img.addEventListener("load", () => {
                    this.canvas.getContext("2d").drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                });
                img.setAttribute("src", drawplace[0].canvas);

                this.draw()
            },
            connect_to_sharedb() {
                this.doc = connection.get('drawings', '0');
                let doc = this.doc;
                const update = () => {
                    console.log('QUERY GOT UPDATED');
                    this.$store.dispatch('update_from_sharedb', connection);
                    this.draw_updated_canvas();
                };
                this.doc.on('ready', update);
                this.doc.subscribe(function(err) {
                    if (err) throw err;
                    doc.on('op', update);
                });

            }
        },
        mounted() {
            this.create_canvas();
            this.connect_to_sharedb();
            this.add_eventlistners();
            this.start_listening_eventbus();
        }
    }
</script>

<style scoped>
    .draw-space {
        height: 80vh;
    }
</style>

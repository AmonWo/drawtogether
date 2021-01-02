<template>
    <!--<div id="draw-space" class="draw-space col-12" style="border: 2px solid green" :tool="tool">-->
    <div id="draw-space" class="draw-space col-12" :tool="tool">
        <!--    <p>DEBUG:<br>OLDPOS: {{ parseInt(this.old_pos.x) + '/' + parseInt(this.old_pos.y) }}<br>NEWPOS:
              {{ parseInt(this.new_pos.x) + '/' + parseInt(this.new_pos.y) }}<br>MOVES: {{this.mouse_moves.slice(-1)[0] }}</p>-->
        <canvas id="draw-canvas" style="border: 2px solid white"></canvas>
        <v-dialog v-model="dialog"
                  max-width="290"
        >
            <v-card>
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
                            color="green"
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
    import {EventBus} from '@/plugins/eventbus'
    import connection from '@/plugins/sharedb_client';

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
            drawplaceName: String,
        },
        computed: {
            drawplace: function () {
                return this.$store.state.drawplace
            }
        },
        data() {
            return {
                canvas: null,
                ctx: null,
                drawingSpace: null,
                dialog: false,
                title: "",
                doc: null,
                mouse_pos: {x: 0, y: 0},
                old_pos: {x: 0, y: 0},
                new_pos: {x: 0, y: 0},
                mouse_moves: [],
                shapes: [],
                drawMethod: 'draw',
                shape: null,
                mouseEvent: null
            }
        },
        methods: {
            create_canvas() {
                this.canvas = document.getElementById('draw-canvas');
                this.drawingSpace = document.getElementById('draw-space');
                this.ctx = this.canvas.getContext('2d');
                this.canvas.style.width = '100%';
                this.canvas.style.height = '100%';
                this.canvas.height = this.canvas.offsetHeight;
                this.canvas.width = this.canvas.offsetWidth;
                console.log('CREATED CANVAS from DRAWPLACE.VUE')
            },
            save_drawplace() {
                //
            },
            submit_to_sharedb() {
                let payload;
                if (this.shapes.length > 0) {
                    payload = {
                        drawplaceName: this.drawplaceName,
                        paths: this.mouse_moves,
                        shapes: this.shapes,
                        connection: connection,
                        doc: this.doc
                    }
                } else {
                    payload = {
                        drawplaceName: this.drawplaceName,
                        paths: this.mouse_moves,
                        shapes: null,
                        connection: connection,
                        doc: this.doc
                    }
                }

                this.$store.dispatch('submit_to_sharedb', payload);
                this.mouse_moves = [];
                this.shapes = [];
                this.shape = null
            },
            show_dialog() {
                this.dialog = !this.dialog
            },
            draw(e, redraw = false, newData = null) {
                switch (this.drawMethod) {
                    case "draw":
                        if (e != null) {
                            if (e.buttons !== 1) return;
                        }
                        if (this.tool === 'pencil') {
                            this.ctx.globalCompositeOperation = 'source-over';
                            this.ctx.strokeStyle = this.brushColor;
                        } else if (this.tool === 'eraser') {
                            this.ctx.globalCompositeOperation = 'destination-out';
                            this.ctx.strokeStyle = 'black'
                        }
                        this.ctx.lineWidth = this.brushSize;
                        this.ctx.lineCap = 'round';
                        if (!redraw) {
                            this.ctx.beginPath(); // begin
                            this.ctx.globalAlpha = this.alpha;
                            this.ctx.moveTo(this.mouse_pos.x, this.mouse_pos.y); // from
                            this.old_pos = {x: this.mouse_pos.x, y: this.mouse_pos.y};
                            //this.mouse_moves.push(this.old_pos)
                            this.find_mouse_pos(e);
                            this.new_pos = {
                                x: this.mouse_pos.x,
                                y: this.mouse_pos.y,
                                bs: this.brushSize,
                                bc: this.brushColor,
                                op: this.alpha,
                                tool: this.tool
                            }
                            this.mouse_moves.push(this.new_pos)
                            this.ctx.lineTo(this.mouse_pos.x, this.mouse_pos.y); // to
                            this.ctx.stroke();
                            this.ctx.closePath()
                        } else {
                            //console.log('REDRAW: ', newData);
                            let path = new Path2D();
                            for (let i = 0; i < newData.length; i++) {
                                if (newData[i].tool === 'pencil') {
                                    this.ctx.globalCompositeOperation = 'source-over';
                                    this.ctx.lineWidth = newData[i].bs;
                                    this.ctx.strokeStyle = newData[i].bc;
                                    this.ctx.globalAlpha = newData[i].op;
                                } else if (newData[i].tool === 'eraser') {
                                    this.ctx.globalCompositeOperation = 'destination-out';
                                    this.ctx.lineWidth = newData[i].bs;
                                    this.ctx.strokeStyle = 'black';
                                    this.ctx.globalAlpha = newData[i].op;
                                }
                                if (i === 0) {
                                    path.moveTo(newData[0].x, newData[0].y)
                                } else {
                                    path.lineTo(newData[i].x, newData[i].y)
                                }
                                this.ctx.lineWidth = newData[i].bs;
                                this.ctx.strokeStyle = newData[i].bc;
                                this.ctx.globalAlpha = newData[i].op;
                            }
                            this.ctx.stroke(path);
                            path.closePath();
                        }
                        break;
                    case 'rectangle':
                        this.draw_rectangle(e, redraw, newData);
                        break;
                    case 'triangle':
                        this.draw_triangle(e, redraw, newData);
                        break;
                    case 'circle':
                        this.draw_circle(e, redraw, newData);
                        break;
                }
            },
            draw_rectangle(e, redraw, newData) {
                if (!redraw) {
                    if (e.buttons === 1) {
                        this.ctx.globalCompositeOperation = 'source-over';
                        if (this.shape.startX === 0 && this.shape.startY === 0) {
                            this.shape.startX = this.mouse_pos.x;
                            this.shape.startY = this.mouse_pos.y;
                            this.shape.drag = true;
                        }
                        this.find_mouse_pos(e);
                        //console.log(this.rect.startX, this.rect.startY, this.mouse_pos.x, this.mouse_pos.y);
                        this.shape.w = this.mouse_pos.x - this.shape.startX;
                        this.shape.h = this.mouse_pos.y - this.shape.startY;
                        this.shape.color = this.brushColor;
                        this.ctx.strokeStyle = this.shape.color;
                        this.ctx.fillStyle = this.shape.color;
                        //this.ctx.rect(this.shape.startX, this.shape.startY, this.shape.w, this.shape.h);
                    }
                } else {
                    if (newData !== null) {
                        this.ctx.globalCompositeOperation = 'source-over';
                        for (let i = 0; i < newData.length; i++) {
                            //console.log('NEWDATA', newData[i]);
                            if(newData[i].type === 'rect'){
                                this.ctx.beginPath();
                                this.ctx.strokeStyle = newData[i].color;
                                this.ctx.fillStyle = newData[i].color;
                                this.ctx.rect(newData[i].startX, newData[i].startY, newData[i].w, newData[i].h);
                                this.ctx.stroke();
                                this.ctx.fill()
                            }
                        }
                    }
                }

            },
            draw_circle(e, redraw, newData) {
                if (!redraw) {
                    if (e.buttons === 1) {
                        this.ctx.globalCompositeOperation = 'source-over';
                        if (this.shape.startX === 0 && this.shape.startY === 0) {
                            this.shape.startX = this.mouse_pos.x;
                            this.shape.startY = this.mouse_pos.y;
                            this.shape.drag = true;
                        }
                        this.find_mouse_pos(e);
                        //console.log(this.rect.startX, this.rect.startY, this.mouse_pos.x, this.mouse_pos.y);
                        this.shape.w = this.mouse_pos.x - this.shape.startX;
                        this.shape.h = this.mouse_pos.y - this.shape.startY;
                        this.shape.color = this.brushColor;
                        this.ctx.strokeStyle = this.shape.color;
                        this.ctx.fillStyle = this.shape.color;
                        //this.ctx.arc(this.shape.startX, this.shape.startY, this.shape.startX + this.shape.width, 0, 2 * Math.PI);
                    }
                } else {
                    if (newData !== null) {
                        this.ctx.globalCompositeOperation = 'source-over';
                        for (let i = 0; i < newData.length; i++) {
                            //console.log('NEWDATA', newData[i]);
                            if(newData[i].type === 'circle'){
                                this.ctx.beginPath();
                                this.ctx.strokeStyle = newData[i].color;
                                this.ctx.fillStyle = newData[i].color;
                                this.ctx.arc(newData[i].startX, newData[i].startY, (newData[i].w), 0, 2 * Math.PI);
                                this.ctx.stroke();
                                this.ctx.fill()
                            }
                        }
                    }
                }
            },
            draw_triangle(e, redraw, newData) {
                if (!redraw) {
                    if (e.buttons === 1) {
                        this.ctx.beginPath();
                        this.ctx.globalCompositeOperation = 'source-over';
                        if (this.shape.startX === 0 && this.shape.startY === 0) {
                            this.shape.startX = this.mouse_pos.x;
                            this.shape.startY = this.mouse_pos.y;
                            this.shape.drag = true;
                        }
                        this.find_mouse_pos(e);
                        //console.log(this.rect.startX, this.rect.startY, this.mouse_pos.x, this.mouse_pos.y);
                        this.shape.w = this.mouse_pos.x;
                        this.shape.h = this.mouse_pos.y;
                        this.shape.color = this.brushColor;
                        this.ctx.strokeStyle = this.shape.color;
                        this.ctx.fillStyle = this.shape.color;
                        this.ctx.stroke();
                        this.ctx.fill();
                        this.ctx.closePath();
                    }
                } else {
                    if (newData !== null) {
                        this.ctx.globalCompositeOperation = 'source-over';
                        for (let i = 0; i < newData.length; i++) {
                            if(newData[i].type === 'triangle') {
                                this.ctx.beginPath();
                                this.ctx.strokeStyle = newData[i].color;
                                this.ctx.fillStyle = newData[i].color;
                                this.ctx.moveTo(newData[i].startX + (newData[i].w - newData[i].startX) / 2, newData[i].startY);
                                this.ctx.lineTo(newData[i].startX, newData[i].h);
                                this.ctx.lineTo(newData[i].w, newData[i].h);
                                this.ctx.lineTo(newData[i].startX + (newData[i].w - newData[i].startX) / 2, newData[i].startY);
                                this.ctx.stroke();
                                this.ctx.fill()
                            }
                        }
                    }
                }

            },
            find_mouse_pos(e) {
                //this.mouseEvent = e;
                var rect = this.canvas.getBoundingClientRect();
                this.mouse_pos.x = (e.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width;
                this.mouse_pos.y = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height;
            },
            add_eventlisteners() {
                this.canvas.addEventListener('mousemove', this.draw);
                //this.canvas.addEventListener('mousemove', this.find_mouse_pos);
                this.canvas.addEventListener('touchmove', this.draw);
                this.canvas.addEventListener('mousedown', this.find_mouse_pos);
                this.canvas.addEventListener('mouseenter', this.find_mouse_pos);
                this.canvas.addEventListener('mouseup', this.find_mouse_pos);
                this.canvas.addEventListener('mouseup', () => {
                    if (this.shape !== null) {
                        this.shapes.push(this.shape);
                    }
                    this.submit_to_sharedb()
                });
                this.canvas.addEventListener('touchend', () => {
                    this.submit_to_sharedb()
                });
                this.canvas.addEventListener('touchcancel', () => {
                    this.submit_to_sharedb()
                });
                this.canvas.addEventListener('dblclick', (e) => {
                    let shapes = this.$store.getters.getDrawplace.shapes;
                    let index = 0;
                    for (let shape of shapes) {
                        this.find_mouse_pos(e);
                        if (shape[0].type === 'rect') {
                            if (this.mouse_pos.x >= shape[0].startX && this.mouse_pos.x <= shape[0].startX + shape[0].w && this.mouse_pos.y >= shape[0].startY && this.mouse_pos.y <= shape[0].startY + shape[0].h) {
                                this.$store.dispatch('delete_from_sharedb', {
                                    connection: connection,
                                    drawplaceName: this.drawplaceName,
                                    doc: this.doc,
                                    index: index
                                })
                            }
                        } else if (shape[0].type === 'triangle') {
                            if (this.mouse_pos.x >= shape[0].startX && this.mouse_pos.x <= shape[0].startX + shape[0].w && this.mouse_pos.y >= shape[0].startY && this.mouse_pos.y <= shape[0].startY + shape[0].h) {
                                this.$store.dispatch('delete_from_sharedb', {
                                    connection: connection,
                                    drawplaceName: this.drawplaceName,
                                    doc: this.doc,
                                    index: index
                                })
                            }
                        } else if (shape[0].type === 'circle') {
                            if(((this.mouse_pos.x - shape[0].startX) ** 2 + (this.mouse_pos.y - shape[0].startY) ** 2) < shape[0].w){
                                this.$store.dispatch('delete_from_sharedb', {
                                    connection: connection,
                                    drawplaceName: this.drawplaceName,
                                    doc: this.doc,
                                    index: index
                                })
                            }
                        }

                        index++;
                    }
                });
                console.log('EVENTLISTENERS ADDED in DRAWPLACE.VUE')
            },
            start_listening_eventbus() {
                EventBus.$on('show_dialog', () => {
                    this.show_dialog()
                });
                EventBus.$on('connect_to_sharedb', () => {
                    this.connect_to_sharedb()
                });
                EventBus.$on('draw_rectangle', () => {
                    this.shape = {
                        startX: 0,
                        startY: 0,
                        w: 0,
                        h: 0,
                        drag: false,
                        type: 'rect',
                        color: 'black',
                    };
                    this.drawMethod = 'rectangle'
                });
                EventBus.$on('draw_circle', () => {
                    this.shape = {
                        startX: 0,
                        startY: 0,
                        w: 0,
                        h: 0,
                        drag: false,
                        type: 'circle',
                        color: 'black',
                    };
                    this.drawMethod = 'circle'
                });
                EventBus.$on('draw_triangle', () => {
                    this.shape = {
                        startX: 0,
                        startY: 0,
                        w: 0,
                        h: 0,
                        drag: false,
                        type: 'triangle',
                        color: 'black',
                    };
                    this.drawMethod = 'triangle'
                });
                console.log('EVENTBUS INITIALIZED in DRAWPLACE.VUE')
            },
            draw_updated_canvas() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                let dp = this.$store.getters.getDrawplace;
                console.log('DRAW_UPDATED_CANVAS: ', dp);
                for (let i = 0; i < dp.paths.length; i++) {
                    this.drawMethod = 'draw';
                    this.draw(null, true, dp.paths[i])
                }
                // eslint-disable-next-line no-unused-vars
                console.log('SHAPES: ', dp.shapes);
                for (let i = 0; i < dp.shapes.length; i++) {
                    this.drawMethod = 'draw';
                    this.draw_rectangle(null, true, dp.shapes[i]);
                    this.draw_triangle(null, true, dp.shapes[i]);
                    this.draw_circle(null, true, dp.shapes[i]);
                }
                this.drawMethod = 'draw'
            },
            connect_to_sharedb() {
                console.log('CONNECT_TO_SHAREDB from DRAWPLACE.VUE -> ID = ', this.drawplaceName);
                this.doc = connection.get('drawings', this.drawplaceName);
                console.log('DOC:\n', this.doc);
                const checkVersion = () => {
                    console.log('CHECK VERSION')
                    console.log(this.doc)
                    console.log(this.doc.version)
                    if (this.doc.version === 0) {
                        let dp = this.$store.getters.getDrawplace;
                        var data = {drawplaceName: this.drawplaceName, paths: dp.paths, shapes: dp.shapes};
                        this.doc.create(data)
                    } else {
                        update()
                    }
                }

                const update = () => {
                    console.log('QUERY GOT UPDATED');
                    let payload = {
                        connection: connection,
                        drawplaceName: this.drawplaceName
                    }
                    this.$store.dispatch('update_from_sharedb', payload);
                    this.draw_updated_canvas();
                }


                this.doc.on('load', checkVersion)
                this.doc.on('ready', update)


                let doc = this.doc
                this.doc.subscribe(function (err) {
                    if (err) throw err;
                    doc.on('op', update);
                });

            }
        },
        mounted() {
            this.create_canvas();
            //this.connect_to_sharedb();
            this.add_eventlisteners();
            this.start_listening_eventbus();
        },
        updated() {
            this.connect_to_sharedb()
        }
    }
</script>

<style scoped>
    .draw-space {
        height: 100vh;
    }
</style>

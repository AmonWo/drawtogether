<template>
    <!--<div id="draw-space" class="draw-space col-12" style="border: 2px solid green" :tool="tool">-->
    <div id="draw-space" class="draw-space col-12" :tool="tool">
        <!--    <p>DEBUG:<br>OLDPOS: {{ parseInt(this.old_pos.x) + '/' + parseInt(this.old_pos.y) }}<br>NEWPOS:
              {{ parseInt(this.new_pos.x) + '/' + parseInt(this.new_pos.y) }}<br>MOVES: {{this.mouse_moves.slice(-1)[0] }}</p>-->
        <canvas id="draw-canvas" style="border: 2px solid white"></canvas>
        <v-dialog v-model="showExport"
                  max-width="290"
        >
            <v-card>
                <v-card-title class="headline">
                    Wählen Sie das gewünschte <br> <b>Dateiformat</b>
                </v-card-title>
                <v-card-actions>
                    <v-radio-group class="mx-auto" v-model="exportType">
                        <v-radio id="jpg" value="jpg" label="JPG"/>
                        <v-radio id="png" value="png" label="PNG"/>
                        <v-radio id="pdf" value="pdf" label="PDF"/>
                    </v-radio-group>
                </v-card-actions>
                <v-card-actions>
                    <v-btn
                            height="40"
                            width="80"
                            class="black--text font-weight-bold visible"
                            color="yellow"
                            block
                            @click="export_drawplace(exportType)"
                    >
                        Speichern
                        <v-icon class="hand-cursor visible" style="transform: scale(0.7)">$DownloadIcon</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {EventBus} from '@/plugins/eventbus'
    import connection from '@/plugins/sharedb_client';
    import { jsPDF } from "jspdf";

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
                mouseEvent: null,
                showExport: false,
                exportType: null
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
            /*  Zeichen-Funktion
            *   param e: Mouse-Event
            *   param redraw: boolean - true: Nutzer zeichnet selbst - false: Update soll gezeichnet werden
            *   param newData: Neue Daten aus der ShareDB
            * */
            draw(e, redraw = false, newData = null) {
                switch (this.drawMethod) { // Klassenvariable, welche die gewünschte Operation als String enthält
                    case "draw":
                        if (e != null) {
                            if (e.buttons !== 1) return;
                        }
                        // this.tool ist eine Klassenvariable
                        if (this.tool === 'pencil') {
                            // Standard zeichnen auf dem Canvas
                            this.ctx.globalCompositeOperation = 'source-over';
                            this.ctx.strokeStyle = this.brushColor;
                        } else if (this.tool === 'eraser') {
                            // Radiergummi überzeichnet vorhandene Pfade in transparent
                            this.ctx.globalCompositeOperation = 'destination-out';
                            this.ctx.strokeStyle = 'black'
                        }
                        this.ctx.lineWidth = this.brushSize;
                        this.ctx.lineCap = 'round';
                        if (!redraw) { // Falls Nutzer manuell zeichnet
                            this.ctx.beginPath(); // Pfad öffnen - this.ctx ist der Canvas Context als Klassenvariable
                            this.ctx.globalAlpha = this.alpha; // Opacity setzen
                            this.ctx.moveTo(this.mouse_pos.x, this.mouse_pos.y); // Zur aktuellen Mausposition bewegen
                            this.old_pos = {x: this.mouse_pos.x, y: this.mouse_pos.y}; // Aktuelle Position speichern
                            this.find_mouse_pos(e); // Neue Mausposition finden
                            this.new_pos = { // Objekt beinhaltet: Mausposition, Strichstärke, Pinselfarbe, Opacity, Werkzeug
                                x: this.mouse_pos.x,
                                y: this.mouse_pos.y,
                                bs: this.brushSize,
                                bc: this.brushColor,
                                op: this.alpha,
                                tool: this.tool
                            }
                            this.mouse_moves.push(this.new_pos) // Objekt wird einem Array angehängt
                            this.ctx.lineTo(this.mouse_pos.x, this.mouse_pos.y); // Zeichne Linie zwischen alter Mausposition und aktueller Mausposition
                            this.ctx.stroke(); // Pfad füllen
                            this.ctx.closePath() // Pfad schließen
                        } else { // Falls update gezeichnet werden soll
                            let path = new Path2D(); // Neuen 2D Pfad erstellen
                            for (let i = 0; i < newData.length; i++) { // Durch die neuen Update-Daten itereiren
                                if (newData[i].tool === 'pencil') { // Wenn der Pfad mit dem Pinsel gezeichnet wurde ->
                                    this.ctx.globalCompositeOperation = 'source-over';
                                    this.ctx.lineWidth = newData[i].bs;
                                    this.ctx.strokeStyle = newData[i].bc;
                                    this.ctx.globalAlpha = newData[i].op;
                                } else if (newData[i].tool === 'eraser') { // Wenn der Pfad mit dem Radiergummi gezeichnet wurde ->
                                    this.ctx.globalCompositeOperation = 'destination-out';
                                    this.ctx.lineWidth = newData[i].bs;
                                    this.ctx.strokeStyle = 'black';
                                    this.ctx.globalAlpha = newData[i].op;
                                }
                                if (i === 0) { // Anfangsposition des Pfades festlegen
                                    path.moveTo(newData[0].x, newData[0].y)
                                } else {
                                    path.lineTo(newData[i].x, newData[i].y) // Schritt für Schritt die weiteren Punkte verbinden
                                }
                                this.ctx.lineWidth = newData[i].bs; // Pinselstärke setzen
                                this.ctx.strokeStyle = newData[i].bc; // Pinselfarbe setzen
                                this.ctx.globalAlpha = newData[i].op; // Opacity setzen
                            }
                            this.ctx.stroke(path); // Pfad füllen
                            path.closePath(); // Pfad schließen
                        }
                        break;
                    case 'rectangle':
                        this.draw_rectangle(e, redraw, newData); // Rechteck zeichen, ermöglicht durch klicken, gedrückt halten und ziehen das erstellen von Rechtecken
                        break;
                    case 'triangle':
                        this.draw_triangle(e, redraw, newData); // Siehe Rechteck
                        break;
                    case 'circle':
                        this.draw_circle(e, redraw, newData); // Siehe Rechteck
                        break;
                }
            },
            /*  Rechteck zeichnen
            *   param e: Mouse-Event
            *   param redraw: boolean - false: Nutzer zeichnet selbst - true: Update soll gezeichnet werden
            *   param newData: Neue Daten aus der ShareDB
            * */
            draw_rectangle(e, redraw, newData) { // e: Mouse-Event, redraw:
                if (!redraw) { // Wenn manuell gezeichnet werden soll (redraw = false)
                    if (e.buttons === 1) { // Wenn die linke Maustaste gedrückt und gehalten wird
                        this.ctx.globalCompositeOperation = 'source-over'; // Context Operation setzen
                        // this.shape ist wieder eine Klassenvariable die zurückgesetzt wird, sobald das Zeichnen eines Rechtecks abgeschlossen ist
                        if (this.shape.startX === 0 && this.shape.startY === 0) { // Sind die Default Werte (0) gesetzt
                            this.shape.startX = this.mouse_pos.x; // werden die aktuellen Mauskooridnaten als Startwert für das Rechteck gesetzt
                            this.shape.startY = this.mouse_pos.y;
                            this.shape.drag = true; // Bisher nicht verwendet, soll zukünftig zum verschieben dienen
                        }
                        this.find_mouse_pos(e); // Diese Funktion speichert die aktuelle Mausposition in this.mouse_pos
                        this.shape.w = this.mouse_pos.x - this.shape.startX; // Berechnung der Rechtecksbreite und Höhe in Abhängigkeit von der Startposition
                        this.shape.h = this.mouse_pos.y - this.shape.startY;
                        this.shape.color = this.brushColor; // Setzen der Farbe des Rechtecks
                        this.ctx.strokeStyle = this.shape.color; // Setzen der Randfarbe des Canvas Contextes
                        this.ctx.fillStyle = this.shape.color; // Setzen der Füllfarbe des Canvas Contextes
                    }
                } else {
                    // Wenn neue Daten vorhanden sind, werden die Rechtecke gemäß der Daten erstellt und gezeichnet
                    if (newData !== null) {
                        this.ctx.globalCompositeOperation = 'source-over';
                        for (let i = 0; i < newData.length; i++) {
                            if(newData[i].type === 'rect'){
                                this.ctx.beginPath();
                                this.ctx.strokeStyle = newData[i].color;
                                this.ctx.fillStyle = newData[i].color;
                                this.ctx.rect(newData[i].startX, newData[i].startY, newData[i].w, newData[i].h);
                                this.ctx.stroke();
                                this.ctx.fill();
                                this.ctx.closePath();
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
                    this.delete_shape(e)
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
                    let type = 'rect';
                    this.set_shape(type);
                    this.drawMethod = type;
                });
                EventBus.$on('draw_circle', () => {
                    let type = 'circle';
                    this.set_shape(type);
                    this.drawMethod = type;
                });
                EventBus.$on('draw_triangle', () => {
                    let type = 'triangle';
                    this.set_shape(type);
                    this.drawMethod = type;
                });
                EventBus.$on('export_drawplace', () => {
                    this.showExport = true
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
                // Diese Funktion stellt die Verbindung zur ShareDB her und erstellt ein Dokument, falls keines vorhanden ist
                console.log('CONNECT_TO_SHAREDB from DRAWPLACE.VUE -> ID = ', this.drawplaceName);

                this.doc = connection.get('drawings', this.drawplaceName); // GET-Request an die ShareDB, 'drawings' ist der Name der Collection und 'drawplaceName' die ID des Dokuments

                console.log('DOC:\n', this.doc);

                const checkVersion = () => {
                    // Diese Funktion überprüft die Version, ist das Dokument nicht vorhanden, ist die Version = 0 und es wird ein neues Dokument erstellt
                    console.log('CHECK VERSION')
                    console.log(this.doc)
                    console.log(this.doc.version)
                    if (this.doc.version === 0) {
                        let dp = this.$store.getters.getDrawplace;
                        var data = {drawplaceName: this.drawplaceName, paths: dp.paths, shapes: dp.shapes};
                        this.doc.create(data)
                    } else {
                    // Ist das Dokument vorhanden, wird es aktualisiert
                        update()
                    }
                }

                const update = () => {
                    // Diese Funktion, wird ausgelöst, wenn das remote Dokument aktualisiert/verändert wird
                    console.log('QUERY GOT UPDATED');
                    let payload = {
                        connection: connection,
                        drawplaceName: this.drawplaceName
                    }
                    // Ist dies der Fall wird im Store das Update geladen und hinterlegt
                    this.$store.dispatch('update_from_sharedb', payload);
                    // Daraufhin erfolgt das neu zeichnen des Canvas
                    this.draw_updated_canvas();
                }

                // Eventlistener werden dem lokalen Dokument hinzugefügt
                this.doc.on('load', checkVersion)
                this.doc.on('ready', update)

                // Lokales Dokument wird abbonniert um auf Remote Änderungen zu reagieren
                let doc = this.doc
                this.doc.subscribe(function (err) {
                    if (err) throw err;
                    doc.on('op', update);
                });

            },
            set_shape(type){
                // Setzen von this.shape != null
                this.shape = {
                    startX: 0,
                    startY: 0,
                    w: 0,
                    h: 0,
                    drag: false,
                    type: type,
                    color: 'black',
                };
            },
            delete_shape(e) {
                // Wird von einem Doppelklick aufgerufen, ist der Zeiger dabei in der Mitte der Form, wird es gelöscht
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
            },
            export_drawplace(export_type) {
                var data;
                var pdf;
                var link = document.createElement('a');
                if (export_type == null) {
                    alert('Kein Dateiformat ausgewählt')
                }
                switch (export_type) {
                    case 'pdf':
                        data = this.canvas.toDataURL('image/jpg', 1.0);
                        pdf = new jsPDF({orientation: 'l', unit: 'px', format: [this.canvas.width, this.canvas.height]});
                        pdf.addImage(data, 0, 0, this.canvas.width, this.canvas.height);
                        pdf.save(this.drawplaceName);
                        break;
                    case 'jpg':
                        data = this.canvas.toDataURL('image/jpg', 1.0);
                        link.download = this.drawplaceName + '.jpg';
                        link.href = data;
                        link.click();
                        break;
                    case 'png':
                        data = this.canvas.toDataURL('image/png', 1.0);
                        link.download = this.drawplaceName + '.png';
                        link.href = data;
                        link.click();
                        break;
                }
                this.showExport = !this.showExport
            }
        },
        mounted() {
            // Diese Funktionen werden ausgeführt, sobald die Vue Komponente vollständig geladen wurde
            this.create_canvas();
            this.add_eventlisteners();
            this.start_listening_eventbus();
        },
        updated() {
            // Wird in den anfänglichen Dialog der Name der Zeichenfläche eingegeben, erfolgt ein Update und daraufhin wird die Verbindung zur ShareDB initialisiert
            this.connect_to_sharedb()
        }
    }
</script>

<style scoped>
    .draw-space {
        height: 100vh;
    }
</style>

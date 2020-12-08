<template>
  <div id="draw-space" class="draw-space col-12" style="border: 2px solid green" :tool="tool">
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
//import Doc from "sharedb";

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
    draw_place_stack: function () {
      return this.$store.state.draw_place_stack
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
      mouse_moves: []
    }
  },
  methods: {
    create_canvas() {
      this.canvas = document.getElementById('draw-canvas');
      this.drawingSpace = document.getElementById('draw-space');
      this.ctx = this.canvas.getContext('2d');
      this.canvas.style.width = '100%'
      this.canvas.style.height = '100%'
      this.canvas.height = this.canvas.offsetHeight;
      this.canvas.width = this.canvas.offsetWidth;
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
        drawplaceName: this.drawplaceName,
        canvas: this.mouse_moves,
        connection: connection,
        doc: this.doc
      };
      this.$store.dispatch('submit_to_sharedb', payload)
      this.mouse_moves = []
    },
    show_dialog() {
      this.dialog = !this.dialog
    },
    draw(e, redraw=false, newData=null) {
      if (this.tool === 'pencil') {
        this.ctx.globalCompositeOperation = 'source-over'
      } else if (this.tool === 'eraser') {
        this.ctx.globalCompositeOperation = 'destination-out'
      }
      if(e != null) {
        if (e.buttons !== 1) return;
      }
      this.ctx.lineWidth = this.brushSize;
      this.ctx.lineCap = 'round';
      this.ctx.strokeStyle = this.brushColor;
      if (!redraw) {
        this.ctx.beginPath(); // begin
        this.ctx.globalAlpha = this.alpha
        this.ctx.moveTo(this.mouse_pos.x, this.mouse_pos.y); // from
        this.old_pos = {x: this.mouse_pos.x, y: this.mouse_pos.y}
        //this.mouse_moves.push(this.old_pos)
        this.find_mouse_pos(e);
        this.new_pos = {x: this.mouse_pos.x, y: this.mouse_pos.y, bs: this.brushSize, bc: this.brushColor, op: this.alpha}
        this.mouse_moves.push(this.new_pos)
        this.ctx.lineTo(this.mouse_pos.x, this.mouse_pos.y); // to
        this.ctx.stroke();
        this.ctx.closePath()
      } else {
        for(let i = 0; i < newData.length; i++) {
          for(let j = 0; j < newData[i].length; j++){
            this.ctx.beginPath()
            this.ctx.lineWidth = newData[i][j].bs
            this.ctx.strokeStyle = newData[i][j].bc
            this.ctx.globalAlpha = newData[i][j].op
            this.ctx.moveTo(newData[i][j].x, newData[i][j].y)
            if (j+1 < newData[i].length) {
              this.ctx.lineTo(newData[i][j + 1].x, newData[i][j + 1].y)
            } else {
              this.ctx.lineTo(newData[i][j].x, newData[i][j].y)
            }
            this.ctx.stroke()
            this.ctx.closePath()
          }
        }

      }
    },
    find_mouse_pos(e) {
      var rect = this.canvas.getBoundingClientRect();
      this.mouse_pos.x = (e.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width;
      this.mouse_pos.y = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height;
    },
    add_eventlistners() {
      this.canvas.addEventListener('mousemove', this.draw);
      this.canvas.addEventListener('mousedown', this.find_mouse_pos);
      this.canvas.addEventListener('mouseenter', this.find_mouse_pos);
      this.canvas.addEventListener('mouseup', () => {
        this.submit_to_sharedb()
      })
    },
    start_listening_eventbus() {
      EventBus.$on('show_dialog', () => {
        this.show_dialog()
      })
      EventBus.$on('connect_to_sharedb', () => {
        this.connect_to_sharedb()
      })
    },
    draw_updated_canvas() {
      console.log('DRAW_UPDATED_CANVAS: ', this.$store.getters.getDrawplaceStack.length)
      this.draw(null, true, this.$store.getters.getDrawplaceStack)
    },
    connect_to_sharedb() {
      this.doc = connection.get('drawings', this.drawplaceName)

      const checkVersion = () => {
        console.log('CHECK VERSION')
        console.log(this.doc)
        console.log(this.doc.version)
        if(this.doc.version === 0) {
          var data = {drawplaceName: this.drawplaceName, canvas: this.$store.getters.getDrawplaceStack};
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

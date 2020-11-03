<template>
  <div class="container">
    <div class="row">
      <div id="draw-space" class="draw-space col-12 pb-10">
        <canvas id="draw-canvas" style="border: 2px solid black"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DrawPlace",
  methods: {
    draw() {
      console.log('DRAW')
      this.ctx.beginPath();
      this.ctx.moveTo(this.prevX, this.prevY);
      this.ctx.lineTo(this.currX, this.currY);
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.closePath();
    },
    find_mouse_pos(res, e) {
      console.log('FIND_MOUSE_POS')
      if (res === 'down') {
        this.prevX = this.currX
        this.prevY = this.currY
        this.currX = e.clientX - this.canvas.offsetLeft
        this.currY = e.clientY - this.canvas.offsetTop

        this.flag = true
        this.dot_flag = true

        if (this.dot_flag) {
          this.ctx.beginPath()
          this.ctx.fillStyle = 'red'
          this.ctx.fillRect(this.currX, this.currY, 2, 2)
          this.ctx.closePath()
          this.dot_flag = false
        }
      }
      if (res === 'up' || res === 'out') {
        this.flag = false
      }
      if (res === 'move') {
        if(this.flag) {
          this.prevX = this.currX
          this.prevY = this.currY
          this.currX = e.clientX - this.canvas.offsetLeft
          this.currY = e.clientY - this.canvas.offsetTop
          this.draw()
        }
      }
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
      drawingSpace: null
    }
  }
  ,
  mounted() {
    this.canvas = document.getElementById('draw-canvas')
    this.drawingSpace = document.getElementById('draw-space')
    this.ctx = this.canvas.getContext('2d')
    this.canvas.height = this.drawingSpace.clientHeight - 30
    this.canvas.width = this.drawingSpace.clientWidth - 30

    this.canvas.addEventListener("mousemove", (e) => {
      this.find_mouse_pos('move', e)
    })

    this.canvas.addEventListener('mousedown', (e) => {
      this.find_mouse_pos('down', e)
    })

    this.canvas.addEventListener('mouseup', (e) => {
      this.find_mouse_pos('down', e)
    })

    this.canvas.addEventListener('mouseout', (e) => {
      this.find_mouse_pos('out', e)
    })
  }
}
</script>

<style scoped>
.draw-space {
  height: 80vh;
}
</style>

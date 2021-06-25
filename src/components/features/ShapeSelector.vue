<template>
  <div class="shape-selector">
    <div class="tool-container" style="z-index: 3">
      <v-icon
          color="black"
      >mdi-shape-outline
      </v-icon>
    </div>
    <div class="tool-container more-tools" @click="draw_rectangle">
      <v-icon color="black">mdi-rectangle-outline</v-icon>
    </div>
    <div class="tool-container more-tools" @click="draw_circle">
      <v-icon color="black">mdi-circle-outline</v-icon>
    </div>
    <div class="tool-container more-tools" @click="draw_triangle">
      <v-icon color="black">mdi-triangle-outline</v-icon>
    </div>
  </div>
</template>

<script>
import {EventBus} from '../../plugins/eventbus'

export default {
  name: "ShapeSelector",
  data() {
    return {
      expanded: false,
    }
  },
  methods: {
    draw_rectangle() {
      console.log('EMIT DRAW_RECTANGLE');
      EventBus.$emit('draw_rectangle')
    },
    draw_circle() {
      EventBus.$emit('draw_circle')
    },
    draw_triangle() {
      EventBus.$emit('draw_triangle')
    },
    show_more_shapes() {
      console.log('SELECT_MORE_SHAPES (ShapeSelector)');
      let x = 0;
      let moreTools = Array.from(document.querySelectorAll('.more-tools'));
      if (!this.expanded) {
        moreTools.forEach((tool) => {
          x += 50;
          tool.style.transform = `translateX(${x}px)`;
          tool.classList.toggle('active');
        });
      } else {

        moreTools.slice().reverse().forEach((tool) => {
          x = 0;
          tool.style.transform = `translateX(${x}px)`;
          tool.classList.toggle('active');
        })
      }
      this.expanded = !this.expanded
    },
    start_listening_eventbus() {
      EventBus.$on('show_more_shapes', this.show_more_shapes)
    },
  },
  mounted() {
    this.start_listening_eventbus()
  }

}
</script>

<style scoped lang="scss">
.shape-selector {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.tool-container {
  color: black;
  background-color: white;
  height: 42px;
  width: 42px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  border: 1px solid black;
  filter: invert(0);
  transition: all .25s $transition-timing-function;
}

.tool-container:hover {
  filter: invert(100%);
}

.more-tools {
  position: absolute;
  opacity: 0;
  transform: translateX(-0);
  transition: all .75s $transition-timing-function;
  z-index: 4;
}

.active {
  opacity: 1;
  transform: translateX(-0);
}
</style>

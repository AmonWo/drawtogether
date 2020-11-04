<template>
    <div id="color-picker-container">
        <canvas id="cp-canvas" :size="size"></canvas>
    </div>
</template>

<script>
    import {EventBus} from '../../plugins/eventbus'
    export default {
        name: 'ColorPicker',
        props: {
            size: Number
        },
        data() {
            return {
                canvas: null,
                ctx: null,
                image: null,
                data: null,
                canvasContainer: null,
                angle: 0,
                hexCode: [0, 0, 255],
                pivotPointer: 0,
                colorOffset: 4.322,
                radius: 0
            }
        },
        methods: {
            pick_color(parent, e) {
                console.log(parent)
                console.log(parent.offsetLeft, parent.offsetTop)
                console.log(e.clientX - parent.offsetLeft, e.clientY - parent.offsetTop)
                console.log(this.ctx.getImageData(e.clientX - parent.offsetLeft, e.clientY - 40, 1, 1).data)
                let color = this.ctx.getImageData(e.clientX - parent.offsetLeft, e.clientY - 40, 1, 1).data
                EventBus.$emit('new_color', color)
            },
            degreesToRadians(degrees) {
                return degrees * (Math.PI / 180);
            },
            drawColorWheel(canvas, size = this.size) {
                this.ctx = canvas.getContext('2d');
                canvas.width = size;
                canvas.height = size;

                const centerColor = 'white';

                // Initiate variables
                this.radius = size / 2;

                while (this.angle < 360) {
                    // find index immediately before and after our pivot
                    const pivotPointerbefore = (this.pivotPointer + 3 - 1) % 3;

                    // Modify colors
                    if (this.hexCode[this.pivotPointer] < 255) {
                        // If main points isn't full, add to main pointer
                        this.hexCode[this.pivotPointer] =
                            this.hexCode[this.pivotPointer] + this.colorOffset > 255 ?
                                255 :
                                this.hexCode[this.pivotPointer] + this.colorOffset;
                    } else if (this.hexCode[pivotPointerbefore] > 0) {
                        // If color before main isn't zero, subtract
                        this.hexCode[pivotPointerbefore] =
                            this.hexCode[pivotPointerbefore] > this.colorOffset ?
                                this.hexCode[pivotPointerbefore] - this.colorOffset :
                                0;
                    } else if (this.hexCode[this.pivotPointer] >= 255) {
                        // If main color is full, move pivot
                        this.hexCode[this.pivotPointer] = 255;
                        this.pivotPointer = (this.pivotPointer + 1) % 3;
                    }

                    const rgb = `rgb(${this.hexCode.map(h => Math.floor(h)).join(',')})`;
                    const grad = this.ctx.createRadialGradient(
                        this.radius,
                        this.radius,
                        0,
                        this.radius,
                        this.radius,
                        this.radius
                    );
                    grad.addColorStop(0, centerColor);
                    grad.addColorStop(1, rgb);
                    this.ctx.fillStyle = grad;

                    // draw circle portion
                    this.ctx.globalCompositeOperation = 'source-over';
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.radius, this.radius);
                    this.ctx.arc(
                        this.radius,
                        this.radius,
                        this.radius,
                        this.degreesToRadians(this.angle),
                        this.degreesToRadians(360)
                    );
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.angle++;
                }
            },

        },
        mounted() {
            this.canvas = document.getElementById('cp-canvas')
            this.drawColorWheel(this.canvas)
            EventBus.$on('pick_color', (payload) => {
                this.pick_color(payload.parent, payload.e)
            })
        }
    }
</script>
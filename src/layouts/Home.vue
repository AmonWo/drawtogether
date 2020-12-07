<template>
    <v-app id="inspire">
        <v-system-bar app>
            <v-spacer></v-spacer>

            <v-icon>mdi-square</v-icon>

            <v-icon>mdi-circle</v-icon>

            <v-icon>mdi-triangle</v-icon>
        </v-system-bar>

        <v-app-bar
                app
                clipped-right
                flat
                height="72"
        >
            <v-spacer></v-spacer>

            <v-responsive max-width="156">
                <v-btn
                        color="green"
                        block
                        rounded
                        @click="save_drawplace"
                >Save
                </v-btn>
            </v-responsive>
        </v-app-bar>

        <v-navigation-drawer
                v-model="drawer"
                app
                width="50"
        >
            <v-navigation-drawer
                    v-model="drawer"
                    absolute
                    color="grey darken-3"
                    mini-variant
            >
                <v-avatar
                        id="color-picker"
                        class="d-flex text-center mx-auto mt-4 justify-center"
                        color="grey darken-1"
                        size="36"
                >
                    <ColorPicker :size="36"></ColorPicker>
                </v-avatar>

                <v-divider class="mx-3 my-5"></v-divider>

                <v-avatar
                        v-for="color of this.colors"
                        :key="color"
                        class="d-block text-center mx-auto mb-9 basic-color-picker"
                        :color="color"
                        size="28"
                ></v-avatar>

                <v-divider class="mx-3 my-5"></v-divider>

                <v-avatar
                        v-for="(tool, index) of this.tools"
                        :key="tool"
                        class="d-block text-center mx-auto mb-9 tool-picker"
                        size="28"
                        @click="pick_tool(index)"
                >
                    <v-icon>mdi-{{ tool }}</v-icon>
                </v-avatar>
                <p id="num-clicks">0</p>
            </v-navigation-drawer>

        </v-navigation-drawer>

        <v-navigation-drawer
                app
                clipped
                right
        >
            <v-list>
                <v-list-item
                        v-for="drawplace of this.draw_place_stack"
                        :key="drawplace.title"
                        link
                        class="drawplace"
                        @click="load_drawplace(drawplace)"
                >
                    <v-list-item-content>
                        <v-list-item-title>{{ drawplace.title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-main>
            <router-view :brushColor="brushColor" :alpha="alpha" :brushSize="brushSize" :tool="tool"></router-view>
        </v-main>

        <v-footer
                app
                color="transparent"
                height="100"
                inset
        >
            <v-slider
                    label="Opacity"
                    v-model="alpha"
                    min="0"
                    max="100"
                    step="1"
                    ticks
                    class="config-slider my-0 py-0"
                    thumb-label
            ></v-slider>
            <v-slider
                    label="Brushsize"
                    v-model="brushSize"
                    min="0"
                    max="100"
                    step="1"
                    ticks
                    class="my-0 py-0"
                    thumb-label
            ></v-slider>
        </v-footer>
    </v-app>
</template>

<script>
    import ColorPicker from "../components/features/ColorPicker";
    import {EventBus} from '../plugins/eventbus'
    import connection from "../plugins/sharedb_client";

    export default {
        components: {ColorPicker},
        data() {
            return {
                drawer: null,
                tool: 'pencil',
                colors: ['red', 'green', 'blue', 'cyan', '#FF00FF', 'yellow', 'black', 'white'],
                tools: ['pencil', 'eraser'],
                brushColor: 'white',
                alpha: 100,
                brushSize: 5,
                drawplace: null,
                draw_place_stack: null,
                query: connection.createSubscribeQuery('drawings')
            }
        },
        methods: {
            save_drawplace() {
                EventBus.$emit('show_dialog')
            },
            load_drawplace(drawplace) {
                EventBus.$emit('load_drawplace', drawplace)
            },
            pick_color(event) {
                EventBus.$emit('pick_color', {parent: document.getElementById('color-picker'), e: event})
            },
            pick_tool(index) {
                this.tool = this.tools[index]
            },
            start_listening_eventbus() {
                EventBus.$on('update_from_sharedb', () => {
                    this.$store.dispatch('update_from_sharedb', this.query)
                });
                EventBus.$on('new_color', (color) => {
                    let red = color[0];
                    let green = color[1];
                    let blue = color[2];
                    this.brushColor = 'rgb(' + red + ', ' + green + ', ' + blue + ')'
                });
            }
        },
        mounted() {
            const update = () => {
                this.$store.dispatch('update_from_sharedb', this.query)
            };

            this.query.on('ready', update);
            this.query.on('changed', update);


            this.start_listening_eventbus();

            let colorPickers = document.getElementsByClassName('basic-color-picker');
            for (let i = 0; i < colorPickers.length; i++) {
                colorPickers[i].addEventListener('click', () => {
                    this.brushColor = this.colors[i]
                })
            }
            let saved_drawplaces = document.getElementsByClassName('drawplace');
            for (let i = 0; i < saved_drawplaces.length; i++) {
                saved_drawplaces[i].addEventListener('click', () => {
                    EventBus.$emit('load_drawplace', this.$store.state.draw_place_stack[i].canvas)
                })
            }

            this.draw_place_stack = this.$store.state.draw_place_stack

            document.getElementById('color-picker').addEventListener('click', (e) => {
                this.pick_color(e)
            })

        }
    }
</script>

<style scoped lang="scss">
    .v-footer {
        .config-slider {
            width: 100%;
        }
    }

    > > > .v-slider__thumb {
        height: 20px;
        width: 20px;
    }

    > > > .v-slider--horizontal .v-slider__track-container {
        height: 10px;
    }
</style>
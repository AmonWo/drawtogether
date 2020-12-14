<template>
    <v-app id="inspire">
        <v-app-bar
                clipped-right
                flat
                height="72"
                color="transparent"
                absolute
                class="invisible"
        >
            <v-spacer/>
            <v-responsive max-width="120" class="px-2">
                <v-btn
                        height="40"
                        width="110"
                        class="black--text font-weight-bold visible"
                        color="lightgray"
                        block
                        @click="save_drawplace"
                >Speichern
                </v-btn>
            </v-responsive>
            <v-responsive max-width="120" class="px-2">
                <v-btn
                        height="40"
                        width="110"
                        class="black--text font-weight-bold visible"
                        color="yellow"
                        block
                        @click="this.get_share_link"
                >Draw teilen
                </v-btn>
            </v-responsive>
            <v-responsive max-width="30" class="px-2">
                <v-icon class="hand-cursor visible">$DownloadIcon</v-icon>
            </v-responsive>
        </v-app-bar>
        <v-container fluid fill-height class="toolbar-container invisible">
            <v-col class="toolbar d-flex justify-space-between flex-column visible">
                <v-row
                        v-for="(tool, index) of this.tools"
                        :key="tool"
                        @click="pick_tool(index, $event)"
                        style="border: 1px solid red"
                        :class="tool"
                >
                    <div class="tool-container hand-cursor visible">
                        <v-icon
                                color="black"
                        >mdi-{{ tool }}
                        </v-icon>
                    </div>
                    <div class="tool-container more-tools" v-if="tool === 'shape-outline'">
                        <v-icon color="black">mdi-rectangle-outline</v-icon>
                    </div>
                    <div class="tool-container more-tools" v-if="tool === 'shape-outline'">
                        <v-icon color="black">mdi-circle-outline</v-icon>
                    </div>
                    <div class="tool-container more-tools" v-if="tool === 'shape-outline'">
                        <v-icon color="black">mdi-triangle-outline</v-icon>
                    </div>
                </v-row>
            </v-col>
        </v-container>
        <v-main>
            <router-view
                    :brushColor="brushColor"
                    :alpha="alpha"
                    :brushSize="brushSize"
                    :tool="tool"
                    :drawplaceName="drawplaceName"

            />
            <v-dialog v-model="newUser"
                      max-width="290"
                      persistent
            >
                <v-card>
                    <v-card-title class="headline">
                        Name des Drawplace
                    </v-card-title>
                    <v-text-field
                            class="pa-10"
                            label="Name"
                            placeholder="Gib einen Namen ein"
                            v-model="drawplaceName"
                    ></v-text-field>
                    <v-card-actions>
                        <v-btn
                                color="green"
                                text
                                @click="connect_to_sharedb()"
                                width="100%"
                        >
                            Speichern
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog v-model="share"
                      max-width="420"
            >
                <v-card>
                    <v-card-title class="headline">
                        Schicke den Link an deine Freunde
                    </v-card-title>
                    <v-text-field
                            class="pa-10 sharelink"
                            v-model="shareLink"
                            readonly
                            @focus="$event.target.select()"
                            style="text-align: center"
                    ></v-text-field>
                </v-card>
            </v-dialog>
        </v-main>
        <v-footer
                height="60"
                width="100%"
                inset
                absolute
                class="footer invisible"
        >
            <transition name="fade">
                <v-color-picker
                        id="color-picker"
                        v-show="showColorPicker"
                        dot-size="25"
                        swatches-max-height="200"
                        v-model="brushColor"
                        class="visible"
                />
            </transition>
            <div class="colorbar mx-auto d-flex flex-row flex-nowrap justify-space-between align-center px-6 visible">
                <v-avatar
                        id="color-picker-button"
                        class="basic-color-picker hand-cursor"
                        color="grey darken-1"
                        size="20"
                        @click="show_colorpicker"
                >
                    <ColorPicker :size="20"></ColorPicker>
                </v-avatar>
                <v-avatar
                        v-for="color of this.colors"
                        :key="color"
                        class="basic-color-picker hand-cursor"
                        :color="color"
                        size="20"
                        @click="pick_color(color)"
                ></v-avatar>
                <v-avatar
                        v-for="size of this.brushSizes"
                        class="basic-color-picker hand-cursor"
                        :key="size"
                        size="20"
                        @click="set_brushsize(size)"
                >
                    <v-icon>${{size}}</v-icon>
                </v-avatar>
            </div>
        </v-footer>
    </v-app>
</template>

<script>
    import ColorPicker from "../components/features/ColorPicker";
    import {EventBus} from '../plugins/eventbus'


    export default {
        components: {ColorPicker},
        data() {
            return {
                drawer: null,
                tool: 'pencil',
                brushColor: 'black',
                alpha: 100,
                brushSize: 5,
                colors: ['red', 'green', 'blue'],
                tools: ['pencil', 'eraser', 'shape-outline', 'note-outline', 'format-text', 'format-color-text'],
                brushSizes: ['BrushSizeSmall', 'BrushSizeMedium', 'BrushSizeLarge'],
                showColorPicker: false,
                drawplace: null,
                draw_place_stack: null,
                newUser: true,
                drawplaceName: '',
                shareLink: '',
                share: false
            }
        },
        methods: {

            set_color_history(color) {
                if (!this.colors.includes(color)) {
                    this.colors.shift();
                    this.colors.push(color)
                }
            },
            set_brushsize(size) {
                switch (size) {
                    case 'BrushSizeSmall':
                        this.brushSize = 5;
                        break;
                    case 'BrushSizeMedium':
                        this.brushSize = 10;
                        break;
                    case 'BrushSizeLarge':
                        this.brushSize = 15;
                        break;
                    default:
                        this.brushSize = 10;
                }
            },
            get_share_link() {
                this.share = !this.share;
                this.shareLink = 'https://dev.amonwondra.de/?drawplace=' + this.drawplaceName
            },
            save_drawplace() {
                EventBus.$emit('show_dialog')
            },
            show_colorpicker() {
                this.showColorPicker = !this.showColorPicker
            },
            pick_color(brushColor) {
                this.brushColor = brushColor
            },
            pick_tool(index, event) {
                console.log(event.target);
                this.tool = this.tools[index]
            },
            add_eventlisteners() {
                let cp = document.getElementById('color-picker');
                let cpb = document.getElementById('color-picker-button');
                cp.addEventListener('mouseleave', () => {
                    this.showColorPicker = !this.showColorPicker;
                    this.set_color_history(this.brushColor)
                });
                cpb.addEventListener('mouseenter', () => {
                    this.showColorPicker = !this.showColorPicker
                });
            },
            start_listening_eventbus() {
                // LEL
            },
            connect_to_sharedb() {
                this.newUser = false;
                EventBus.$emit('connect_to_sharedb');
                console.log('CONNECT_TO_SHAREDB emitted from HOME.VUE')
            }
        },
        beforeMount() {
            if (this.$route.query.drawplace) {
                console.log('URL QUERY: ', this.$route.query.drawplace);
                this.drawplaceName = this.$route.query.drawplace;
                this.newUser = false;
            }
        },
        mounted() {
            if (!this.newUser)
                this.connect_to_sharedb();
            this.add_eventlisteners();
            this.start_listening_eventbus();
        }
    }
</script>

<style scoped lang="scss">
    .visible {
        visibility: visible;
    }

    .invisible {
        visibility: hidden;
    }

    .hand-cursor {
        cursor: pointer;
    }

    .toolbar-container {
        position: absolute;
        width: 90px;

        .toolbar {
            z-index: 3;
            height: 320px;
            width: 60px;
            background-color: white;
            border-radius: 6px;
            box-shadow: -24px 0px 156px rgba(0, 0, 0, 0.259562);

            .tool-container {
                height: 42px;
                width: 42px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                border: 1px solid black;
            }

            .more-tools {
                position: absolute;
                transform: translateX(45px);
            }

            .shape-outline {
                width: fit-content;
                flex-wrap: nowrap;
                overflow: hidden;
                //flex-direction: row;
            }
        }
    }


    .footer {
        left: auto !important;
        right: auto !important;

        .colorbar {
            width: 360px;
            border-radius: 6px;
            height: 100%;
            background-color: black;
        }

        #color-picker {
            border: 1px solid gray;
            position: absolute;
            bottom: 60px;
            left: 0;
            right: 0;
            margin-left: auto;
            margin-right: auto;
        }
    }

</style>

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
                <v-text-field
                        dense
                        flat
                        hide-details
                        rounded
                        solo-inverted
                ></v-text-field>
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
                        class="d-block text-center mx-auto mb-9"
                        :color="color"
                        size="28"
                ></v-avatar>
            </v-navigation-drawer>

<!--            <v-sheet
                    color="grey darken-3"
                    height="128"
                    width="100%"
            ></v-sheet>-->

          <!--  <v-list
                    class="pl-14"
                    shaped
            >
                <v-list-item
                        v-for="n in 5"
                        :key="n"
                        link
                >
                    <v-list-item-content>
                        <v-list-item-title>Item {{ n }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>-->
        </v-navigation-drawer>

        <v-navigation-drawer
                app
                clipped
                right
        >
            <v-list>
                <v-list-item
                        v-for="n in 5"
                        :key="n"
                        link
                >
                    <v-list-item-content>
                        <v-list-item-title>Item {{ n }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-main>
            <router-view></router-view>
        </v-main>

        <v-footer
                app
                color="transparent"
                height="80"
                inset
        >
            <v-slider
                    label="Opacity"
                    v-model="opacity"
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
    export default {
      components: {ColorPicker},
      data () {
        return {
          opacity: 100,
          drawer: null,
          colors: ['red', 'green', 'blue', 'cyan', '#FF00FF', 'yellow', 'black', 'white']
        }
      },
      methods: {
        get_opacity(){return this.opacity.toString()}
      }
    }
</script>

<style scoped>
  >>>.v-slider__thumb {
    height: 20px;
    width: 20px;
  }
  >>>.v-slider--horizontal .v-slider__track-container {
    height: 10px;
  }
</style>
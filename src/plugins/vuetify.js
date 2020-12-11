import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import DownloadIcon from '../assets/DownloadIcon'
import BrushSizeSmall from '../assets/BrushSizeSmall'
import BrushSizeMedium from '../assets/BrushSizeMedium'
import BrushSizeLarge from '../assets/BrushSizeLarge'

Vue.use(Vuetify);

export default new Vuetify({
    theme: { dark: false },
    icons: {
        values: {
            DownloadIcon: {
                component: DownloadIcon
            },
            BrushSizeSmall: {
                component: BrushSizeSmall
            },
            BrushSizeMedium: {
                component: BrushSizeMedium
            },
            BrushSizeLarge: {
                component: BrushSizeLarge
            }
        }
    }
});

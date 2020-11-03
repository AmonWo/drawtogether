import Vue from "vue";
import VuetifyAdmin from "vuetify-admin";

import "vuetify-admin/src/loader";


/*import {
  simpleRestDataProvider,
  jwtAuthProvider,
} from "vuetify-admin/src/providers";*/
import {
  en,
} from "vuetify-admin/src/locales";

import router from "@/router";
import routes from "@/router/admin";
import store from "@/store";
import i18n from "@/i18n";
import resources from "@/resources";
//import axios from "axios";

/**
 * Load Admin UI components
 */
Vue.use(VuetifyAdmin);

/**
 * Axios instance
 */
//const baseURL = process.env.VUE_APP_API_URL || "http://localhost:3000";

/*const http = axios.create({
  baseURL,
  headers: { "X-Requested-With": "XMLHttpRequest" , "Acces-Control-Allow-Origin": "*"},
  proxy: false,
});*/

/**
 * Init admin
 */
export default new VuetifyAdmin({
  router,
  store,
  i18n,
  title: "Vuetify Admin",
  routes,
  locales: {
    en,
  },
  translations: [
    "en",
  ],
/*  dataProvider: simpleRestDataProvider(http),
  authProvider: jwtAuthProvider(
    http
  ),*/
  resources,
  //http,
  options: {
    dateFormat: "long",
  },
});

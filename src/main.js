import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import i18n from './i18n'
import router from './router'
import store from './store'
// import admin from "./plugins/admin";
import "./plugins/i18n";
import "./plugins/base";
import "./plugins/chartist";
import "./sass/overrides.sass";

Vue.config.productionTip = false

new Vue({
  vuetify,
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')

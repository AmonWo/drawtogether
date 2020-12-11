import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/layouts/Home"
import DrawPlace from "@/views/DrawPlace";
/*import Login from "@/views/auth/Login";
import Register from "@/views/auth/Register";
import ForgotPassword from "@/views/auth/ForgotPassword";
import ResetPassword from "@/views/auth/ResetPassword";
import i18n from "@/i18n";
import AuthLayout from "@/layouts/Auth";*/

Vue.use(VueRouter);

const routes = [
  {
    path: "",
    redirect: "home",
    component: Home,
    children: [
      {
        path: "/",
        name: "home",
        component: DrawPlace,
        meta: {
          title: 'DrawPlace'
        },
        props: true
      }
    ],

   /* children: [
      {
        path: "/login",
        name: "login",
        component: Login,
        meta: {
          title: i18n.t("routes.login"),
        },
      },
      {
        path: "/register",
        name: "register",
        component: Register,
        meta: {
          title: i18n.t("routes.register"),
        },
      },
      {
        path: "/forgot-password",
        name: "forgot_password",
        component: ForgotPassword,
        meta: {
          title: i18n.t("routes.forgot_password"),
        },
      },
      {
        path: "/reset-password/:token",
        name: "reset_password",
        component: ResetPassword,
        props: true,
        meta: {
          title: i18n.t("routes.reset_password"),
        },
      },
    ],*/
  },
  {
    path: "/home",
    component: Home
  }
];

export default new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

import Vue from "vue"
import App from "./App.vue"

Vue.config.productionTip = false

// import "vue-awesome/icons";
import "vue-awesome/icons/arrow-down";
import "vue-awesome/icons/copy";
import "vue-awesome/icons/lock";
import "vue-awesome/icons/redo";
import "vue-awesome/icons/times";

import Icon from "vue-awesome/components/Icon";
Vue.component("Icon", Icon);

import Button from "@/components/Button";
Vue.component("Button", Button);

import "./main.css";

new Vue({
  render: function (h) { return h(App) },
}).$mount("#app")

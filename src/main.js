// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// table 的样式需要手动引入
import 'element-ui/lib/theme-chalk/icon.css'
import 'element-ui/lib/theme-chalk/table.css'
import 'element-ui/lib/theme-chalk/table-column.css'

import axios from 'axios'
import {post, fetch, patch, put} from './utils/http'
Vue.prototype.$axios = axios
Vue.prototype.$post = post
Vue.prototype.$fetch = fetch
Vue.prototype.$patch = patch
Vue.prototype.$put = put
Vue.config.productionTip = false
Vue.use(ElementUI)
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

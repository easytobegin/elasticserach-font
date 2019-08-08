/**
 * Created by yqr on 2018/3/26.
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  collapsed: false,
  topNavState: 'home',
  leftNavState: 'home'
}

for (var item in state) {
  if (localStorage.getItem(item)) {
    state[item] = JSON.parse(localStorage.getItem(item))
  } else {
    state[item] = false
  }
}

export default new Vuex.Store({
  state
})

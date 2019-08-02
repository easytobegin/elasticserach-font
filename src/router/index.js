import Vue from 'vue'
import Router from 'vue-router'
import IndexSerach from '@/components/IndexSerach'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'IndexSerach',
      component: IndexSerach
    }
  ]
})

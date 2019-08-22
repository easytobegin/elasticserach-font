/**
 * Created by yqr on 2018/3/26.
 */
import Vue from 'vue'
import Router from 'vue-router'
import LeftNav from '@/components/nav/LeftNav.vue'
import IndexSearch from '@/components/IndexSearch.vue'
import NotFound from '@/components/404.vue'
import Home from '@/components/nav/Home.vue'
import ElasticSetting from '@/components/setting/ElasticSetting.vue'
import DepAlarm from '@/components/alarm/DepAlarm.vue'
import Alarm from '@/components/alarm/Alarm.vue'
import TopNav from '@/components/nav/TopNav.vue'
import Setting from '@/components/setting/Setting.vue'
import Manager from '@/components/alarm/Manager.vue'
import AlarmMethod from '@/components/alarm/AlarmMethod.vue'
import Dic from '@/components/setting/Dic.vue'
import AlarmTemplate from '@/components/alarm/AlarmTemplate.vue'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '*',
      component: NotFound
    },
    {
      path: '/',
      type: 'home',
      name: 'home',
      redirect: '/index',
      component: Home,
      children: [
        {
          path: '/index',
          name: '数据总览',
          components: {
            default: IndexSearch,
            aside: LeftNav,
            top: TopNav
          },
          leaf: true, // 只有一个节点
          iconCls: 'iconfont icon-home', // 图标样式class
          menuShow: true
        },
        {
          path: '/alarm',
          name: '异常预警',
          components: {
            default: Alarm,
            aside: LeftNav,
            top: TopNav
          },
          iconCls: 'el-icon-alarm-clock',
          menuShow: true,
          children: [
            { path: '/alarm/dep', component: DepAlarm, name: '通用预警配置', menuShow: true },
            { path: '/alarm/man', component: Manager, name: '告警责任人配置', menuShow: true },
            { path: '/alarm/method', component: AlarmMethod, name: '告警方式配置', menuShow: true },
            { path: '/alarm/template', component: AlarmTemplate, name: '预警模板配置', menuShow: true }
          ]
        },
        {
          path: '/systemSetting',
          name: '系统设置',
          components: {
            default: Setting,
            aside: LeftNav,
            top: TopNav
          },
          iconCls: 'el-icon-setting', // 图标样式class
          menuShow: true,
          children: [
            { path: '/systemSetting/elasticsearch', component: ElasticSetting, name: '索引管理', menuShow: true },
            { path: '/systemSetting/dic', component: Dic, name: '字典管理', menuShow: true }
          ]
        }
      ]
    }
  ]
})

// router.beforeEach((to, from, next) => {
//   // console.log('to:' + to.path)
//   if (to.path.startsWith('/login')) {
//     window.localStorage.removeItem('access-user')
//     next()
//   } else {
//     let user = JSON.parse(window.localStorage.getItem('access-user'))
//     if (!user) {
//       next({path: '/login'})
//     } else {
//       next()
//     }
//   }
// })

export default router

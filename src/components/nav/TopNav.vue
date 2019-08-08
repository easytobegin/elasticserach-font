<template>
  <el-row class="container">
    <!--头部-->
    <el-col :span="24" class="topbar-wrap">
      <div class="topbar-logo topbar-btn">
        <a href="/"><img src="../../assets/logo.png" style="padding-left:8px;"></a>
      </div>
      <div class="topbar-logos">
        <a href="/" style="color: #fff;"><span v-show="!$store.state.collapsed">兆翔监控预警平台</span></a>
      </div>
      <div class="topbar-account topbar-btn">
        <el-dropdown trigger="click">
          <span class="el-dropdown-link userinfo-inner">
            <i class="iconfont icon-user"></i>
            {{nickname}}
            <i class="el-icon-caret-bottom"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <div @click="jumpTo('/user/profile')">
                <span style="color: #555;font-size: 14px;">个人信息</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item>
              <div @click="jumpTo('/user/changepwd')">
                <span style="color: #555;font-size: 14px;">修改密码</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-col>
  </el-row>
</template>
<script>
import 'element-ui/lib/theme-chalk/display.css'
import { road } from '../../road.js'

export default {
  data () {
    return {
      loading: false,
      companyName: '',
      nickname: '',
      defaultActiveIndex: '/',
      homeMenu: false,
      messageCount: 5
    }
  },
  created () {
    road.$on('setNickName', text => {
      this.nickname = text
    })

    road.$on('goto', url => {
      if (url === '/login') {
        localStorage.removeItem('access-user')
        this.$router.push(url)
      }
    })
    // 组件创建完后获取数据
    this.fetchNavData()
  },
  methods: {
    jumpTo (url) {
      this.$router.push(url) // 用go刷新
    },
    handleSelect (index) {
      this.defaultActiveIndex = index
    },
    fetchNavData () {
      // 初始化菜单激活项
      let curpath = this.$route.path // 获取当前路由
      let routers = this.$router.options.routes // 获取路由对象
      let navtype = ''
      let navname = ''
      for (var i = 0; i < routers.length; i++) {
        let children = routers[i].children
        if (children) {
          for (let j = 0; j < children.length; j++) {
            if (children[j].path === curpath) {
              navtype = routers[i].type
              navname = routers[i].name
              break
            }
            // 如果该菜单下还有子菜单
            if (children[j].children) {
              let grandChildren = children[j].children
              for (let z = 0; z < grandChildren.length; z++) {
                if (grandChildren[z].path === curpath) {
                  navtype = routers[i].type
                  navname = routers[i].name
                  break
                }
              }
            }
          }
        }
      }
      this.$store.state.topNavState = navtype
      this.$store.state.leftNavState = navname
      if (navtype === 'home') {
        this.defaultActiveIndex = '/'
      } else {
        this.defaultActiveIndex = '/' + navname + 'Manager'
      }
    },
    logout () {
      this.$confirm('确认退出吗?', '提示', {
        confirmButtonClass: 'el-button--warning'
      })
        .then(() => {
          localStorage.removeItem('access-user')
          road.$emit('goto', '/login')
        })
        .catch(() => {})
    }
  },
  mounted () {
    let user = window.localStorage.getItem('access-user')
    if (user) {
      user = JSON.parse(user)
      this.nickname = user.nickname || ''
      this.companyName = user.companyName || ''
    }
  },
  watch: {
    $route: function (to, from) {
      this.fetchNavData()
    }
  }
}
</script>

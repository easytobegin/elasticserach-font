<template>
  <div class="warp-main">
    <el-row :gutter="20">
      <el-col :span="2">
        <el-button type="primary" @click="search()">搜索预警规则</el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="success" @click="addRule()">新增规则</el-button>
      </el-col>
      <span style="color:red;">TIPS: ① 为了保护Elasticsearch引擎的性能，操作结果将延迟1.5s展示</span>
      <span style="color:red;">② 为方便开发人员编写监控预警语句，本系统采用SQL语句编写，程序将SQL自动转成引擎可以识别的语句</span>
    </el-row>
    <el-row>
      <el-table
        :data="tableData"
        style="width: 99%">
        <el-table-column
          prop="ruleEnName"
          label="规则代号"
          width="250">
        </el-table-column>
        <el-table-column
          prop="ruleCnName"
          label="规则名"
          width="250">
        </el-table-column>
         <el-table-column
          prop="alarmLevel"
          label="预警等级"
          width="150">
        </el-table-column>
         <el-table-column
          prop="enable"
          label="是否启用"
          width="150">
        </el-table-column>
         <el-table-column
          prop="sql"
          label="监控语句">
        </el-table-column>
         <el-table-column
          fixed="right"
          label="操作"
          width="300">
          <template slot-scope="scope">
            <el-button @click="modifyRule(scope.row)" type="success">修改规则</el-button>
            <el-button @click="deleteRule(scope.row)" type="danger">删除规则</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-dialog
      title="告警配置"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose">
      <el-scrollbar style="height:100%">
        <el-row>
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入sql语句"
            v-model="words.sqlText">
          </el-input>
        </el-row>
        <br/>
        <el-row>
          <el-input
            type="textarea"
            placeholder="请输入规则代号(英文)"
            v-model="words.ruleEnCode">
          </el-input>
        </el-row>
        <br/>
        <el-row>
          <el-input
            type="textarea"
            placeholder="请输入规则代号(中文)"
            v-model="words.ruleCnCode">
          </el-input>
        </el-row>
        <br/>
        <el-row>
          <el-input
            type="textarea"
            placeholder="请输入预警等级"
            v-model="words.ruleLevel">
          </el-input>
        </el-row>
        <br/>
        <el-row>
          <el-col :span="4">
            <el-tag>是否启用</el-tag>
          </el-col>
          <el-col :span="15">
             <el-switch
              v-model="words.enable"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
          </el-col>
        </el-row>
        <br/>
        <el-row>
          <el-button type="warning" @click="viewSqlResult()">预览执行结果</el-button>
          <el-button type="primary" @click="setAlarm()">确认设置该预警</el-button>
        </el-row>
        <br/>
        <el-row>
          <pre style="width:700px;height:700px;" >
            {{sqlInfoJson}}
          </pre>
        </el-row>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      words: {
        sqlText: '',
        ruleEnCode: '',
        ruleCnCode: '',
        ruleLevel: '',
        enable: '',
        id: '',
        index: '',
        type: ''
      },
      deleteWords: {
        id: '',
        indexName: '',
        type: ''
      },
      total: 0,
      sqlInfoJson: '',
      sqlText: '',
      dialogVisible: false,
      indexValue: '',
      transfer_data: [],
      options: [],
      tableData: [{
        id: '',
        index: '',
        type: '',
        ruleEnName: '',
        ruleCnName: '',
        enable: '',
        alarmLevel: '',
        sql: ''
      }],
      addRules: {
        indexName: '',
        type: '',
        params: {}
      },
      addOrUpdate: true
    }
  },
  methods: {
    setAlarm () {
      this.addRules.indexName = 'rules-store'
      this.addRules.type = '_doc'
      this.addRules.params['content'] = this.words.sqlText
      this.addRules.params['ruleEnName'] = this.words.ruleEnCode
      this.addRules.params['ruleCnName'] = this.words.ruleCnCode
      this.addRules.params['enable'] = this.words.enable
      this.addRules.params['ruleLevel'] = this.words.ruleLevel
      this.addRules.params['timestamp'] = new Date()
      // 新增
      if (this.addOrUpdate === true) {
        this.$post('/indexFunc', this.addRules).then((data) => {
          if (data.ok === true) {
            this.$notify({
              title: '成功',
              message: '新增规则成功！',
              type: 'success'
            })
            this.dialogVisible = false
            // console.log(data.message)
          } else {
            this.$notify.error({
              title: '错误',
              message: '新增规则失败！'
            })
          }
        })
      } else {
        this.addRules.type = this.words.type
        this.addRules.indexName = this.words.index
        this.addRules.id = this.words.id
        this.$put('/indexFunc', this.addRules).then((data) => {
          if (data.ok === true) {
            this.$notify({
              title: '成功',
              message: '新增规则成功！',
              type: 'success'
            })
            this.dialogVisible = false
            // console.log(data.message)
          } else {
            this.$notify.error({
              title: '错误',
              message: '新增规则失败！'
            })
          }
        })
      }
      this.autoRefresh()
    },
    viewSqlResult () {
      this.$post('/alarm/sql', {sql: this.words.sqlText}).then((data) => {
        if (data.ok === true) {
          console.log(JSON.parse(data.message))
          // this.total = data.message.hits.total
          this.sqlInfoJson = JSON.parse(data.message)
        } else {
          this.$notify.error({
            title: '错误',
            message: '该sql无效！'
          })
        }
      })
    },
    handleClose () {
      this.dialogVisible = false
    },
    addRule () {
      this.words = {}
      this.words.enable = true
      this.addOrUpdate = true
      this.dialogVisible = true
    },
    modifyRule (value) {
      this.addOrUpdate = false
      this.dialogVisible = true
      this.words.sqlText = value.sql
      if (value.enable === '是') {
        this.words.enable = true
      } else {
        this.words.enable = false
      }
      this.words.ruleLevel = value.alarmLevel
      this.words.ruleEnCode = value.ruleEnName
      this.words.ruleCnCode = value.ruleCnName
      this.words.type = value.type
      this.words.index = value.index
      this.words.id = value.id
    },
    deleteRule (value) {
      this.deleteWords.indexName = value.index
      this.deleteWords.id = value.id
      this.deleteWords.type = value.type
      this.$post('/indexFunc/delete', this.deleteWords).then((data) => {
        if (data.ok === true) {
          this.$notify({
            title: '成功',
            message: '删除该条记录成功',
            type: 'success'
          })
        } else {
          this.$notify.error({
            title: '错误',
            message: '删除该条记录失败！'
          })
        }
      })
      this.autoRefresh()
    },
    search () {
      this.tableData = []
      let query = 'select * from rules-store'
      this.$post('/alarm/sql', {sql: query}).then((data) => {
        if (data.ok === true) {
          let result = JSON.parse(data.message)
          console.log(result)
          result.hits.hits.forEach(hit => {
            let index = hit._source
            let enableCode = ''
            if (index.enable) {
              enableCode = '是'
            } else {
              enableCode = '否'
            }
            let json = {id: hit._id, index: hit._index, type: hit._type, ruleEnName: index.ruleEnName, ruleCnName: index.ruleCnName, enable: enableCode, alarmLevel: index.ruleLevel, sql: index.content}
            this.tableData.push(json)
          })
          // // this.total = data.message.hits.total
          // this.sqlInfoJson = JSON.parse(data.message)
        } else {
          this.$notify.error({
            title: '错误',
            message: '该sql无效！'
          })
        }
      })
    },
    searchIndexData () {
      this.tableData = []
      this.$fetch('/index').then((data) => {
        if (data.ok === true) {
          this.options = []
          data.data.forEach(element => {
            this.options.push({'value': element.index, 'label': element.index})
          })
        } else {
          this.$notify.error({
            title: '错误',
            message: '请求索引数据失败！'
          })
        }
      })
    },
    autoRefresh () {
      setTimeout(this.search, 1500)
    },
    setRefreshTime () {
      this.$put('/refreshTime', {}).then((data) => {
        if (data.ok === true) {
        } else {
          this.$notify.error({
            title: '错误',
            message: '初始化刷新时间失败！'
          })
        }
      })
    }
  },
  mounted () {
    this.searchIndexData()
    this.setRefreshTime()
    this.search()
  }
}
</script>

<style scoped>
.index_input_style {
  width: 250px;
}
</style>

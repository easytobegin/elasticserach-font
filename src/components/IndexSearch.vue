<template>
  <div class="warp-main">
    <el-row :gutter="20">
      <el-col :span="1">
        <el-tag type="success">当前索引</el-tag>
      </el-col>
      <el-col :span="4">
        <el-select filterable class="index_input_style" v-model="indexValue" placeholder="请选择索引" @change="generateTransferData(indexValue)">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            >
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button type = "primary" icon="el-icon-s-opportunity" @click="searchIndexData()">获取索引列表</el-button>
      </el-col>
      <el-col :span="2">
        <el-button :type="filterType" icon="el-icon-edit" @click="if_show">{{showFilter}}</el-button>
      </el-col>
      <el-col :span="5">
        <el-input prefix-icon="el-icon-search" @keyup.enter.native="generateJsonData"  v-model="likeSearch" placeholder="索引内容全局查找"></el-input>
      </el-col>
      <el-col :span="2">
        <el-switch
          v-model="isStar"
          active-text="模糊匹配*"
          inactive-text="精确匹配">
        </el-switch>
      </el-col>
      <el-col :span="5">
        <el-button type="success" icon="el-icon-success" @click="generateJsonData()">搜索</el-button>
        <el-button :type="timerType" :icon="refreshIcon" @click="timer">{{timerOpenOrClose}}</el-button>
        <el-tag size="mini" effect="dark" type="warning">{{timeNumber + timeValue + "刷新一次"}}</el-tag>
      </el-col>
      <span>共找到<span style="color:red;">{{total_num}}</span>条记录</span>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-collapse v-model="activeNames" @change="handleChange" v-show="is_show">
          <el-collapse-item title="过滤参数" name="1">
            <el-button type="primary" style="margin-bottom:20px;" icon="el-icon-circle-plus" @click="plusOne()">新增</el-button>
            <el-button type="danger" style="margin-bottom:20px;" icon="el-icon-error" @click="clearAll()">清除所有</el-button>
            <el-row v-for="num in filterParamNums" :key="num.label">
              <el-col :span='7'>
               <el-select clearable filterable class="filterParam_style" v-model="num.label" placeholder="请选择过滤参数" @change="setParam(num)">
                <el-option
                  v-for="index in transfer_data"
                  :key="index.label"
                  :label="index.label"
                  :value="index.label"
                  >
                </el-option>
              </el-select>
              </el-col>
              <el-col :span="4">
                <el-input prefix-icon="el-icon-search" placeholder="请输入值" style="margin-right:20px;" v-model="num.content"></el-input>
              </el-col>
              <el-col :span="2">
                <el-button type="danger" icon="el-icon-minus" style="margin-left:20px;" @click="subOne(num)">删除</el-button>
              </el-col>
            </el-row>
            <!-- <el-row v-for="(index, number) in transfer_data" :key="index.label" :gutter="20">
              <el-col :span="4">
                <el-tag type="success">{{index.label}}</el-tag>
              </el-col>
              <el-col :span="12">
                <el-input v-model="index.content" placeholder="请输入参数值" :disabled="index.disable"></el-input>
              </el-col>
              <el-col :span="4">
                <el-button type="success" @click="set_filter(number)">设置</el-button>
              </el-col>
              <el-col :span="4">
                <el-button type="danger" @click="no_set_filter(number)">不设置</el-button>
              </el-col>
            </el-row> -->
          </el-collapse-item>
          <el-collapse-item title="只看哪些字段" name="2">
            <el-transfer
              :titles="['待选字段', '已选字段']"
              filterable
              filter-placeholder="输入要筛选的字段"
              v-model="transfer_value"
              :data="transfer_data">
            </el-transfer>
          </el-collapse-item>
          <el-collapse-item title="其他参数设置" name="3">
            <el-col :span="4">
                <el-tag type="success">查询超时时间(s)</el-tag>
              </el-col>
              <el-col :span="6">
                <el-input-number v-model="extra_param.timeout" @change="timeout_c" :min="1" :max="1000" label="超时时间"></el-input-number>
              </el-col>
          </el-collapse-item>
          <el-collapse-item title="定时刷新设置" name="4">
            <el-input-number :disabled="timerEnable" v-model="timeNumber" :min="1" :max="10000" label="输入时间"></el-input-number>
            <el-select :disabled="timerEnable" v-model="timeValue" placeholder="天时分秒">
              <el-option
                v-for="item in timerOption"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="2">
        <el-switch
          v-model="orderby"
          active-text="时间降序显示"
          inactive-text="时间升序显示">
        </el-switch>
      </el-col>
      <el-col :span="3"><el-tag>不重新搜索，高亮搜索表格内容</el-tag></el-col>
      <el-col :span="16">
        <el-input
        prefix-icon="el-icon-search"
        style="width:40%;"
        v-model="search"
        size="mini"
        placeholder="输入需要高亮的内容"/>
      </el-col>
    </el-row>
    <el-row>
       <el-col :span="24">
          <el-table
            :data="tableData"
            border
            style="width: 99%">
            <el-table-column
              prop="index"
              label="索引名"
              width="270">
              <template slot-scope="scope">
                  <span v-html="highLight(scope.row.index)" ></span>
              </template>
            </el-table-column>
            <el-table-column
              prop="timestamp"
              label="发生时间"
              sortable
              width="180">
              <template slot-scope="scope">
                  <span v-html="highLight(scope.row.timestamp)" ></span>
              </template>
            </el-table-column>
            <el-table-column
              prop="score"
              label="分数"
              sortable
              width="120">
              <template slot-scope="scope">
                  <span v-html="highLight(scope.row.score)" ></span>
              </template>
            </el-table-column>
            <el-table-column
              prop="type"
              label="类型"
              sortable
              width="120">
              <template slot-scope="scope">
                  <span v-html="highLight(scope.row.type)" ></span>
              </template>
            </el-table-column>
            <el-table-column
              prop="source"
              label="内容">
              <template slot-scope="scope">
                  <span style="margin-right:10px;" v-for="index in scope.row.source" :key="index.key">
                    <el-tag size="mini" effect="dark" color="rgba(0, 46, 63, 0.1)" type="info">{{index.key + ':'}}</el-tag>
                    <span v-html="highLight(index.value)"></span>
                  </span>
                  <!-- <span v-html="highLight(scope.row.source)" ></span> -->
              </template>
            </el-table-column>
            <el-table-column
              fixed="right"
              label="操作"
              width="140">
              <template slot-scope="scope">
                <el-button @click="handleClick(scope.row)" type="danger">删除该记录</el-button>
              </template>
            </el-table-column>
          </el-table>
      </el-col>
    </el-row>
    <el-row>
      <div class="block">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pageNumber"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="params.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total_num">
      </el-pagination>
    </div>
    </el-row>
  </div>
</template>

<script>
export default {
  data () {
    return {
      value: '',
      delete_show: false,
      nums: 1,
      filterParamNums: [],
      filterParam: '',
      showFilter: '显示筛选器',
      timerEnable: false,
      refreshIcon: 'el-icon-video-play',
      timeNumber: 5,
      timeValue: '秒',
      timerOption: [
        {label: '天', value: '天'},
        {label: '时', value: '时'},
        {label: '分', value: '分'},
        {label: '秒', value: '秒'}
      ],
      filterType: 'warning',
      timerType: 'primary',
      timerFlag: true,
      timerOpenOrClose: '自动刷新',
      orderby: true,
      likeSearch: '',
      isStar: true,
      search: '',
      is_show: false,
      transfer_data: [],
      transfer_value: [],
      options: [],
      indexValue: '',
      activeNames: [],
      params: {
        pageNumber: 1,
        pageSize: 10,
        index: '',
        keyword: '',
        timeout: '',
        extra: {},
        source: [],
        timestampOrder: ''
      },
      alreadyChoiceArray: [],
      paper: {
        pageNumber: 1,
        pageSize: 10
      },
      extra_param: {
        timeout: 10
      },
      log_obj: {},
      total_num: 0,
      tableData: [
        {
          id: '',
          index: '',
          score: '',
          type: '',
          timestamp: '',
          source: []
        }
      ],
      currentPage4: 4,
      timestampWord: [],
      sourceStr: '',
      resultStr: [],
      interval: '',
      deleteParam: {
        indexName: '',
        type: '',
        id: ''
      }
    }
  },
  computed: {
    tables () {
      const search = this.search
      if (search) {
        return this.tableData.filter(dataNews => {
          return Object.keys(dataNews).some(key => {
            return String(dataNews[key].toLowerCase().indexOf(search.toLow) > -1)
          })
        })
      }
      return this.tableData
    }
  },
  methods: {
    handleClick (index) {
      this.deleteParam.indexName = index.index
      this.deleteParam.id = index.id
      this.deleteParam.type = index.type
      this.$post('/indexFunc/delete', this.deleteParam).then((data) => {
        if (data.ok === true) {
          this.$notify({
            title: '成功',
            message: '删除该记录成功',
            type: 'success'
          })
        } else {
          this.$notify.error({
            title: '错误',
            message: '删除该记录失败！'
          })
        }
      })
    },
    setParam (index) {
      for (var i = 0; i < this.filterParamNums.length; i++) {
        if (index.label === this.filterParamNums[i].label && index.number !== this.filterParamNums[i].number && index.label !== '') {
          index.label = ''
          this.$notify.error({
            title: '错误',
            message: '选择的字段不能重复'
          })
          break
        }
      }
    },
    clearAll () {
      this.filterParamNums = []
    },
    subOne (index) {
      this.filterParamNums.splice(index.number, 1)
      for (var i = index.number; i < this.filterParamNums.length; i++) {
        this.filterParamNums[i].number -= 1
      }
    },
    plusOne () {
      this.filterParamNums.push({label: '', content: '', number: this.filterParamNums.length})
    },
    timer () {
      let time = 0
      if (this.timerFlag) {
        switch (this.timeValue) {
          case '秒':
            time = this.timeNumber * 1000
            break
          case '分':
            time = this.timeNumber * 1000 * 60
            break
          case '时':
            time = this.timeNumber * 1000 * 3600
            break
          case '天':
            time = this.timeNumber * 1000 * 3600 * 24
            break
        }
        this.timerType = 'danger'
        this.refreshIcon = 'el-icon-loading'
        this.timerOpenOrClose = '停止刷新'
        this.timerEnable = true
        this.refresh(time)
        this.timerFlag = false
      } else {
        this.timerType = 'primary'
        this.refreshIcon = 'el-icon-video-play'
        this.timerOpenOrClose = '自动刷新'
        this.timerEnable = false
        this.cancelRefresh()
        this.timerFlag = true
      }
    },
    refresh (seconds) {
      window.clearInterval(this.interval)
      this.interval = setInterval(this.generateJsonData, seconds)
    },
    cancelRefresh () {
      window.clearInterval(this.interval)
    },
    highLight (val) {
      val = (val + '').toLowerCase()
      if (val.indexOf(this.search.toLowerCase()) !== -1 && this.search.toLowerCase() !== '') {
        return val.replace(this.search, '<font color="#ffffff" style="background: #73cc48">' + this.search + '</font>')
      } else {
        return val
      }
    },
    handleSizeChange (val) {
      this.params.pageSize = val
      this.generateJsonData()
    },
    handleCurrentChange (val) {
      this.params.pageNumber = val
      this.generateJsonData()
    },
    formatDate (datetime) {
      // 获取年月日时分秒值  slice(-2)过滤掉大于10日期前面的0
      var year = new Date(datetime).getFullYear()
      var month = ('0' + (new Date(datetime).getMonth() + 1)).slice(-2)
      var date = ('0' + new Date(datetime).getDate()).slice(-2)
      var hour = ('0' + new Date(datetime).getHours()).slice(-2)
      var minute = ('0' + new Date(datetime).getMinutes()).slice(-2)
      var second = ('0' + new Date(datetime).getSeconds()).slice(-2)
      // 拼接
      var result = year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second
      // 返回
      return result
    },
    parseJson (temp, jsonObj) {
      for (var key in jsonObj) {
        var element = jsonObj[key]
        if (element instanceof Array) {
          // 数组不继续解析，不操作
        } else if (typeof (element) === 'object') {
          let temp1 = ''
          temp1 = temp
          temp += key + '.'
          this.parseJson(temp, element)
          // 回溯
          temp = temp1
        } else {
          let temp1 = ''
          temp1 = temp
          temp += key + '.'
          this.resultStr.push({'key': temp.substring(0, temp.length - 1), 'value': element})
          temp = temp1
        }
      }
    },
    showData (logObj) {
      this.tableData = []
      // console.log(logObj)
      logObj.hits.hits.forEach((element, index) => {
        // let str = ''
        // for (var item in element._source) {
        //   str += (item + ': ' + element._source[item] + ',')
        // }
        // str = str.substring(0, str.length - 1)
        let time = ''
        for (var ele in element._source) {
          if (isNaN(element._source[ele]) && !isNaN(Date.parse(element._source[ele]))) {
            time = this.formatDate(Date.parse(element._source[ele]))
            break
          } else {
            time = '无'
          }
        }
        this.sourceStr = ''
        this.resultStr = []
        // this.getTree('', element._source)
        this.parseJson('', element._source)
        let result = []
        this.resultStr.forEach(source => {
          // result += (source.key + ': ' + source.value + ',')
          result.push({key: source.key, value: source.value})
        })
        // result = result.substring(0, result.length - 1)
        // console.log(result)
        if (element._score === null || element._score === '') {
          element._score = '-'
        }
        this.tableData.push({
          id: element._id,
          index: element._index,
          score: element._score,
          type: element._type,
          timestamp: time,
          source: result
        })
      })
    },
    generateJsonData () {
      this.params.timestampOrder = ''
      this.params.keyword = ''
      // 模糊匹配
      if (this.isStar) {
        this.params.keyword = '*' + this.likeSearch + '*'
      } else {
        this.params.keyword = this.likeSearch
      }
      if (this.isStar === false && (this.likeSearch === null || this.likeSearch === '')) {
        this.$notify.error({
          title: '错误',
          message: '精确匹配模式下，输入不能为空！'
        })
        return
      }
      this.params.index = this.indexValue
      this.params.source = []
      this.transfer_value.forEach((element, index) => {
        this.params.source.push(this.transfer_data[element].label)
      })
      // 优先寻找@time
      for (var element in this.transfer_data) {
        let ele = this.transfer_data[element].label
        if (ele.indexOf('@time') !== -1) {
          this.params.timestampOrder = ele
          break
        }
        if (ele.indexOf('time') !== -1) {
          this.params.timestampOrder = ele
        }
      }
      // 降序
      if (this.orderby && this.params.timestampOrder !== '') {
        this.params.timestampOrder += ':desc'
      } else if (!this.orderby && this.params.timestampOrder !== '') {
        this.params.timestampOrder += ':asc'
      } else {
        this.params.timestampOrder = ''
      }
      let str = {}
      this.filterParamNums.forEach((element, index) => {
        let label = element.label
        let content = element.content
        if (content !== null && content !== '') {
          str[label] = content
        }
      })
      this.params.extra = str
      this.$post('/keywordMatch', this.params).then((data) => {
        if (data.ok === true) {
          this.log_obj = JSON.parse(data.message)
          this.total_num = this.log_obj.hits.total
          this.showData(this.log_obj)
          this.search = this.likeSearch
        } else {
          this.$notify.error({
            title: '错误',
            message: '请求数据失败！'
          })
        }
      })
    },
    // pageNumber_c (val) {
    //   this.params.pageNumber = val
    // },
    // pageSize_c (val) {
    //   this.params.pageSize = val
    // },
    timeout_c (val) {
      this.params.timeout = val + 's'
    },
    set_filter (number) {
      this.transfer_data[number].disable = false
    },
    no_set_filter (number) {
      this.transfer_data[number].disable = true
    },
    if_show () {
      if (this.is_show) {
        this.filterType = 'warning'
        this.showFilter = '显示筛选器'
      } else {
        this.filterType = 'danger'
        this.showFilter = '隐藏筛选器'
      }
      this.is_show = !this.is_show
    },
    handleChange (val) {
      // console.log(val)
    },
    searchIndexData () {
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
    generateTransferData (value) {
      this.tableData = []
      this.total_num = 0
      this.filterParamNums = []
      this.is_show = true
      this.filterType = 'danger'
      this.showFilter = '隐藏筛选器'
      this.params.pageNumber = 1
      this.params.pageSize = 10
      // 生成穿梭框数据
      this.$fetch('/indexDetail', { index: value }).then((data) => {
        if (data.ok === true) {
          this.transfer_data = []
          this.transfer_value = []
          data.data.forEach((element, index) => {
            this.transfer_data.push({
              label: element,
              key: index,
              disable: true,
              content: ''
            })
          })
        } else {
          this.$notify.error({
            title: '错误',
            message: '请求详细索引信息失败'
          })
        }
      })
    },
    // 设置分页最大上限，默认为PageSize * pageNumber < 10000
    settingMaxPage () {
      this.$put('/setMaxSize', {}).then((data) => {
      })
    }
  },
  mounted () {
    this.searchIndexData()
    this.settingMaxPage()
  }
}
</script>

<style>
.el-tag--dark.el-tag--info {
    background-color: #909399;
    border-color: #909399;
    color: #000;
}
.el-row {
    margin-bottom: 20px;
  }
.index_input_style {
  width: 250px;
}
.filterParam_style {
  width: 500px;
}
.el-transfer-panel__body {
  width: 500px;
  height: 300px;
}
.el-transfer-panel__list.is-filterable {
  width: 500px;
  height: 300px;
  padding-top: 0;
}
.el-transfer-panel {
    border: 1px solid #EBEEF5;
    border-radius: 4px;
    overflow: hidden;
    background: #FFF;
    display: inline-block;
    vertical-align: middle;
    width: 500px;
    max-height: 100%;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    position: relative;
}
</style>

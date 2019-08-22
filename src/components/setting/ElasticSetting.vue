<template>
  <div class="warp-main">
    <el-row :gutter="20">
      <el-col :span="2">
        <el-button type="danger" v-show="managerIndex.show" @click="deleteIndex()">删除索引</el-button>
      </el-col>
      <el-col :span="3">
        <el-button type="success" @click="deleteIndexTimer()">定时删除索引设置</el-button>
      </el-col>
      <el-col :span="17">
        <el-input
          prefix-icon="el-icon-search"
          placeholder="索引名称模糊搜索"
          v-model="input"
          @keyup.enter.native="search"
          clearable>
        </el-input>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="search()">搜索</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-table
        :data="tableDataPage"
        style="width: 99%"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
         </el-table-column>
        <el-table-column
          prop="name"
          sortable
          label="索引名称"
          width="350">
        </el-table-column>
        <el-table-column
          prop="health"
          sortable
          label="健康状态"
          width="180">
        </el-table-column>
        <el-table-column
          prop="status"
          sortable
          label="是否启用"
          width="180">
        </el-table-column>
        <el-table-column
          prop="docCount"
          sortable
          label="文档数量">
        </el-table-column>
        <el-table-column
          prop="storageSize"
          label="占用大小">
        </el-table-column>
        <el-table-column
          prop="pristorageSize"
          label="原始占用大小">
        </el-table-column>
         <el-table-column
          fixed="right"
          label="操作"
          width="100">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text">索引详情</el-button>
          </template>
        </el-table-column>
      </el-table>
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
        :total="params.total_num">
      </el-pagination>
    </div>
    </el-row>
    <el-dialog
      title="索引的详细信息"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose">
      <el-scrollbar style="height:100%">
          <pre style="width:700px;height:700px;" >
            {{indexInfoJson}}
          </pre>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      indexInfoJson: '',
      managerIndex: {
        name: '单个',
        show: false
      },
      tableData: [{
        name: '',
        health: '',
        status: '',
        docCount: '',
        storageSize: '',
        pristorageSize: ''
      }],
      params: {
        pageNumber: 1,
        pageSize: 10,
        total_num: 0
      },
      multipleSelection: [],
      input: '',
      tableDataPage: [{
        name: '',
        health: '',
        status: '',
        docCount: '',
        storageSize: '',
        pristorageSize: ''
      }],
      dialogVisible: false
    }
  },
  methods: {
    handleClick (row) {
      this.dialogVisible = true
      this.$fetch('/indexInfo', { index: row.name }).then((data) => {
        if (data.ok === true) {
          this.indexInfoJson = JSON.parse(data.data)
        } else {
          this.$notify.error({
            title: '错误',
            message: '请求索引数据失败！'
          })
        }
      })
    },
    handleClose (done) {
      this.dialogVisible = false
    },
    deleteIndexTimer () {

    },
    deleteIndex () {
      let indexs = []
      this.multipleSelection.forEach((index) => {
        indexs.push(index.name)
      })
      this.$post('/deleteIndex', {indexs: indexs}).then((data) => {
        if (data.ok === true) {
          this.getIndex('')
          this.$notify({
            title: '成功',
            message: '删除索引成功',
            type: 'success'
          })
        } else {
          this.$notify.error({
            title: '错误',
            message: '删除索引失败！'
          })
        }
      })
    },
    deepCopy (obj) {
      var result = Array.isArray(obj) ? [] : {}
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            result[key] = this.deepCopy(obj[key])
          } else {
            result[key] = obj[key]
          }
        }
      }
      return result
    },
    search () {
      this.getIndex(this.input)
    },
    getIndex (indexName) {
      this.tableData = []
      this.$fetch('/index', { params: indexName }).then((data) => {
        if (data.ok === true) {
          this.options = []
          data.data.forEach(element => {
            this.tableData.push({name: element.index, health: element.health, status: element.status, docCount: element.count, storageSize: element.size, pristorageSize: element.priSize})
          })
          this.tableDataPage = this.deepCopy(this.tableData)
          this.params.total_num = this.tableData.length
          this.setPage()
        } else {
          this.$notify.error({
            title: '错误',
            message: '请求索引数据失败！'
          })
        }
      })
    },
    setPage () {
      this.tableDataPage = []
      let startPageSize = (this.params.pageNumber - 1) * this.params.pageSize
      let endPageSize = (this.params.pageNumber) * this.params.pageSize
      if (endPageSize >= this.params.total_num) {
        endPageSize = this.params.total_num
      }
      for (var i = startPageSize; i < endPageSize; i++) {
        this.tableDataPage.push(this.tableData[i])
      }
    },
    handleSizeChange (val) {
      this.params.pageSize = val
      this.setPage()
    },
    handleCurrentChange (val) {
      this.params.pageNumber = val
      this.setPage()
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
      if (this.multipleSelection.length === 0) {
        this.managerIndex.show = false
      } else if (this.multipleSelection.length === 1) {
        this.managerIndex.show = true
        this.managerIndex.name = '单个'
      } else {
        this.managerIndex.show = true
        this.managerIndex.name = '多个'
      }
    }
  },
  mounted () {
    this.getIndex('')
  }
}
</script>

<style>

</style>

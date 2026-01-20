import React, { useEffect, useState } from 'react'
import type { ColumnsType } from 'antd/es/table'
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { ProSearch, ProSearchMore } from '@/components/ProSearch'
import { DialogForm } from '@/components/dialog'
import AddStore from './Add'
import {
  Input,
  DatePicker,
  Select,
  message,
  Col,
  Modal,
  Form,
  Table,
  type TableProps,
  Space,
  Button,
  Tag,
  Spin
} from 'antd'
import styles from './Shein.module.less'
import { storeTypeDict, authStatusDict, shopStatusDict } from '@/constant/storeManage/dict'
import { getStoreList, delStore, updateStoreStatus } from '@/api/temu'
import { getSheinRedirectUrl, setSheinAuthKey } from '@/api/shein'
import { useSearchParams } from 'react-router-dom'
import { getDictLabel } from '@/utils'
import type { Dayjs } from 'dayjs'
import type { TableDataType, SearchParams } from '@/types/storeManage/shein'
import type { PageState } from '@/types/storeManage/store'
const { RangePicker } = DatePicker
const { Option } = Select

const SheinManage: React.FC = () => {
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState<TableDataType[]>([])
  const [tableTotal, setTableTotal] = useState<number>(0)
  const [tableQuery, setTableQuery] = useState<PageState>({ current: 1, pageSize: 10, salePlatformId: 28 })
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    status: '',
    createTime: '',
    storeType: '',
    authStatus: '',
    dateRangeStr: ''
  })
  const [queryParams, setQueryParams] = useSearchParams() // 获取url参数
  const [spinning, setSpinning] = React.useState(false)
  const [percent, setPercent] = React.useState(0)

  const handleSearch = (params: any) => {
    if (params.dateRangeStr && Array.isArray(params.dateRangeStr)) {
      const [start, end] = params.dateRangeStr as [Dayjs, Dayjs]
      params.dateRangeStr = `${start.format('YYYY-MM-DD')},${end.format('YYYY-MM-DD')}`
    }
    setSearchParams(params)
  }
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch({ ...searchParams, keyword: e.currentTarget.value })
    }
  }
  const handleReset = () => {
    setSearchParams({
      keyword: '',
      status: '',
      createTime: '',
      storeType: '',
      authStatus: '',
      dateRangeStr: ''
    })
  }
  const getAuthStatus = (authStatus: number) => {
    if (authStatus == 1) {
      return <Tag color='green'>已授权</Tag>
    } else if (authStatus == 2) {
      return <Tag color='gray'>已过期</Tag>
    } else {
      return <Tag color='red'>未授权</Tag>
    }
  }
  const columns: ColumnsType<TableDataType> = [
    {
      title: '店铺名称',
      dataIndex: 'storeTitle',
      align: 'center',
      sorter: false
    },
    {
      title: '店铺类型',
      dataIndex: 'storeType',
      align: 'center',
      render: (_, record: any) => {
        return <span> {getDictLabel({ value: record.storeType, dictData: storeTypeDict })}</span>
      }
    },
    {
      title: '自定义编号',
      dataIndex: 'storeCode',
      align: 'center'
    },
    {
      title: '店铺代号',
      dataIndex: 'sdsStoreCode',
      align: 'center'
    },
    {
      title: '授权状态',
      dataIndex: 'authStatus',
      align: 'center',
      render: (_, record: any) => {
        return getAuthStatus(record.authStatus)
      }
    },
    {
      title: '店铺状态',
      dataIndex: 'status',
      align: 'center',
      render: (text, record: any) => (
        <Button type='link' danger={record.status == 0 && true}>
          {getDictLabel({
            value: record.status,
            dictData: shopStatusDict
          })}
        </Button>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      render: (_, record: any) => <span>{record.createTime || '--'}</span>
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      align: 'center',
      render: (_, record: any) => <span>{record.updateTime || '--'}</span>
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 220,
      render: (_, record: any) => (
        <Space>
          <DialogForm
            params={{ act: 'update', id: record.id }}
            isDrawer={false}
            component={AddStore}
            title='编辑店铺'
            width='700px'
            onOkCallback={fetchData}
          >
            <Button type='link'>编辑</Button>
          </DialogForm>

          <Button type='link' danger onClick={() => handleDelete(record)}>
            删除
          </Button>

          {record.status == 0 && (
            <Button type='link' onClick={() => handleDisabled(record, 1)}>
              启用
            </Button>
          )}
          {record.status == 1 && (
            <Button type='link' onClick={() => handleDisabled(record, 0)}>
              禁用
            </Button>
          )}
          {record.authStatus !== 1 && (
            <Button type='link' onClick={() => handleAuth(record)}>
              授权{' '}
            </Button>
          )}
        </Space>
      )
    }
  ]

  // 授权
  const handleAuth = (params: any) => {
    try {
      getSheinRedirectUrl({ storeId: params.id }).then((data: any) => {
        window.open(data, '_blank')
      })
    } catch (error) {
      console.log('error is:', error)
    }
  }

  // 禁用
  const handleDisabled = (params: any, statusVal: number) => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: `确认${statusVal === 1 ? '启用' : '禁用'}当前店铺的开业状态吗?`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        updateStoreStatus({ id: params.id, field: 'status', val: statusVal }).then(() => {
          message.success('修改成功')
          fetchData()
        })
      }
    })
  }
  //   删除数据
  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '确认删除当前店铺吗?',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        delStore({ id: record.id }).then(() => {
          message.success('删除成功')
          fetchData()
        })
      }
    })
  }
  const clearUrlParams = () => {
    // 获取当前页面的完整URL
    let currentUrl = window.location.href
    // 使用URL对象解析当前URL
    let urlObj = new URL(currentUrl)
    // 清除查询字符串
    urlObj.search = ''
    // 将修改后的URL设置为当前页面的URL
    window.history.replaceState({}, document.title, urlObj.toString())
  }
  const showLoader = () => {
    setSpinning(true)
    let ptg = -10

    const interval = setInterval(() => {
      ptg += 5
      setPercent(ptg)

      if (ptg > 120) {
        clearInterval(interval)
        setSpinning(false)
        setPercent(0)
      }
    }, 100)
  }
  const handleSetAuthKey = (params: any) => {
    showLoader()
    try {
      setSheinAuthKey(params)
        .then(res => {
          message.success('授权成功')
          fetchData()
          clearUrlParams()
        })
        .catch(err => {
          message.error(err.message)
        })
    } catch (error) {
      console.log('error is:', error)
    }
  }
  useEffect(() => {
    fetchData()
  }, [tableQuery])

  useEffect(() => {
    setTableQuery({ ...tableQuery, ...searchParams })
  }, [searchParams])

  useEffect(() => {
    let reqParams = {
      tempToken: queryParams.get('tempToken'),
      state: queryParams.get('state')
    }
    if (reqParams.tempToken && reqParams.state) {
      handleSetAuthKey(reqParams)
    }
  })

  async function fetchData() {
    setTableLoading(true)
    const data = await getStoreList(tableQuery)
    const { records, total } = data as any
    setTableData(records)
    setTableTotal(total)
    setTableLoading(false)
  }
  function handlePageChange(page: number, pageSize: number) {
    setTableQuery({ ...tableQuery, current: page, pageSize })
  }
  return (
    <div className={styles['md-container']}>
      <Spin spinning={spinning} percent={percent} fullscreen />
      <ProSearch
        labelWidth={100}
        moreQuery={true}
        mode='block'
        onSearch={handleSearch}
        onReset={handleReset}
        gutter={24}
      >
        {/* 默认展示的搜索项 */}
        <Col md={8} sm={24}>
          <Form.Item label='店铺名称' name='keyword'>
            <Input allowClear placeholder='请输入店铺名称' onKeyPress={handleKeyPress} />
          </Form.Item>
        </Col>

        <Col md={8} sm={24}>
          <Form.Item label='店铺类型' name='storeType'>
            <Select placeholder='请选择'>
              {storeTypeDict.map(item => {
                return (
                  <Option value={item.value} key={item.value}>
                    {item.label}
                  </Option>
                )
              })}
            </Select>
          </Form.Item>
        </Col>
        <Col md={8} sm={24}>
          <Form.Item label='授权状态' name='authStatus'>
            <Select placeholder='请选择'>
              {authStatusDict.map(item => {
                return (
                  <Option value={item.value} key={item.value}>
                    {item.label}{' '}
                  </Option>
                )
              })}
            </Select>
          </Form.Item>
        </Col>

        {/* 更多搜索项 - 使用 ProSearchMore 组件 */}
        <ProSearchMore>
          <Col md={8} sm={24}>
            <Form.Item label='店铺状态' name='status'>
              <Select placeholder='请选择'>
                {shopStatusDict.map(item => {
                  return (
                    <Option value={item.value} key={item.value}>
                      {item.label}
                    </Option>
                  )
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col md={8} sm={24}>
            <Form.Item label='创建时间' name='dateRangeStr'>
              <RangePicker
                style={{ width: '100%' }}
                format='YYYY-MM-DD' // 改成字符串
                placeholder={['开始时间', '结束时间']}
              />
            </Form.Item>
          </Col>
        </ProSearchMore>
      </ProSearch>
      <div className={styles['md-action-row']}>
        <DialogForm
          params={{ act: 'add' }}
          isDrawer={false}
          component={AddStore}
          title='新增店铺'
          width='700px'
          onOkCallback={fetchData}
        >
          <Button type='primary' icon={<PlusOutlined />}>
            新增店铺
          </Button>
        </DialogForm>
      </div>
      {/* 表格查询 */}
      <Table
        rowKey='id'
        columns={columns}
        dataSource={tableData}
        loading={tableLoading}
        pagination={{
          current: tableQuery.current,
          pageSize: tableQuery.pageSize,
          total: tableTotal,
          showTotal: () => `总共${tableTotal} 条`,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: handlePageChange
        }}
      />
    </div>
  )
}

export default SheinManage

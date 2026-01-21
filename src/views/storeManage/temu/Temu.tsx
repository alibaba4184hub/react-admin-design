// 使用示例
import React, { useEffect, useState } from 'react'
import type { ColumnsType } from 'antd/es/table'
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { ProSearch, ProSearchMore } from '@/components/ProSearch'
import { DialogForm } from '@/components/dialog'
import AddStore from './Add'
import Test from './Test'
import {
  Input,
  DatePicker,
  Select,
  message,
  Upload,
  Col,
  Modal,
  Form,
  Table,
  type TableProps,
  Space,
  Button,
  Tag
} from 'antd'
import styles from './Temu.module.less'
import { shopTypeDict, authStatusDict, shopStatusDict, tagDict } from '@/constant/storeManage/dict'
import { getStoreList, delStore, updateStoreStatus, downloadLabel, delStoreLabel, updateLabel } from '@/api/temu'
import { getDictLabel } from '@/utils'
import type { Dayjs } from 'dayjs'
import type { TableDataType, SearchParams } from '@/types/storeManage/temu'
import type { PageState } from '@/types/storeManage/store'
const { RangePicker } = DatePicker
const { Option } = Select

const TemuManage: React.FC = () => {
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState<TableDataType[]>([])
  const [tableTotal, setTableTotal] = useState<number>(0)
  const [tableQuery, setTableQuery] = useState<PageState>({ current: 1, pageSize: 10, salePlatformId: 23 })
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    status: '',
    createTime: '',
    storeType: '',
    authStatus: '',
    storeLogoStatus: '',
    dateRangeStr: ''
  })
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
      storeLogoStatus: '',
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
        return <span> {getDictLabel({ value: record.storeType, dictData: shopTypeDict })}</span>
      }
    },
    {
      title: '自定义编号',
      dataIndex: 'storeCode',
      align: 'center'
    },
    {
      title: '店铺ID',
      dataIndex: 'sellerId',
      align: 'center',
      render: (_, record: any) => {
        return (
          <a href={`https://www.temu.com/mall.html?mall_id=${record.sellerId}`} target='_blank' title='查看店铺前台'>
            {record.sellerId || '--'}
          </a>
        )
      }
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
      title: '标签信息',
      dataIndex: 'storeLogoFileName',
      align: 'center',
      render: (_, record: any) => (
        <Button type='link' onClick={() => handleDownloadLabel(record)}>
          {record.storeLogoFileName || '--'}
        </Button>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      render: (_, record: any) => <span>{record.createTime}</span>
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      align: 'center',
      render: (_, record: any) => <span>{record.updateTime}</span>
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
            isDrawer
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
          {!record.storeLogoFileUrl ? (
            <Upload
              showUploadList={false}
              action='#'
              customRequest={uploadFileRequest}
              multiple={false}
              maxCount={1}
              accept='image/*'
              data={{ storeId: record.id }}
            >
              <Button type='link'>上传标签</Button>
            </Upload>
          ) : (
            <Button type='link' onClick={() => handleDeleteLabel(record)}>
              删除标签
            </Button>
          )}
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
        </Space>
      )
    }
  ]

  // 删除标签
  const handleDeleteLabel = (params: any) => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: `确认删除当前店铺的标签信息吗?`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        delStoreLabel({ id: params.id })
        message.success('删除成功')
        fetchData()
      }
    })
  }
  // 下载标签
  const handleDownloadLabel = (params: any) => {
    downloadLabel({ storeId: params.id })
      .then((response: any) => {
        // 创建一个新的Blob对象
        const blob = new Blob([response])
        // 创建一个指向该Blob的URL
        const downloadUrl = window.URL.createObjectURL(blob)
        // 创建一个a标签用于下载
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = params.storeLogoFileName // 设置下载文件的文件名
        document.body.appendChild(link)
        link.click()
        // 清除创建的URL
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(link)
      })
      .catch(error => {
        console.error('Download error:', error)
      })
  }
  // 上传标签
  const MAX_FILE_SIZE = 3 * 1024 * 1024 // 5MB
  const uploadFileRequest = (options: any) => {
    console.log(options)
    const { file, data } = options

    if (file.size > MAX_FILE_SIZE) {
      message.warning('文件大小超过限制，请上传小于5MB的图片')
      return
    }
    const formData = new FormData()
    formData.append('file', file) // 文件对象
    formData.append('storeId', data.storeId) //店铺id
    updateLabel(formData).then(() => {
      message.success('上传成功')
      fetchData()
    })
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

  useEffect(() => {
    fetchData()
  }, [tableQuery])

  useEffect(() => {
    setTableQuery({ ...tableQuery, ...searchParams })
  }, [searchParams])

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
            <Input placeholder='请输入店铺名称' onKeyPress={handleKeyPress} />
          </Form.Item>
        </Col>

        <Col md={8} sm={24}>
          <Form.Item label='店铺类型' name='storeType'>
            <Select placeholder='请选择'>
              {shopTypeDict.map(item => {
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
            <Form.Item label='标签信息' name='storeLogoStatus'>
              <Select placeholder='请选择'>
                {tagDict.map(item => {
                  return (
                    <Option value={item.value} key={item.value}>
                      {item.label}{' '}
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
          isDrawer
          component={AddStore}
          title='新增店铺'
          width='700px'
          onOkCallback={fetchData}
        >
          <Button type='primary' icon={<PlusOutlined />}>
            新增店铺
          </Button>
        </DialogForm>
        <DialogForm
          params={{ act: 'add' }}
          isDrawer
          component={Test}
          title='新增店铺'
          width='700px'
          onOkCallback={fetchData}
        >
          <Button type='primary' icon={<PlusOutlined />}>
            测试店铺
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

export default TemuManage

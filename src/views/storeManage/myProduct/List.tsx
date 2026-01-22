import { type FC, useState, useEffect } from 'react'
import type { ColumnsType } from 'antd/es/table'
import { ExclamationCircleOutlined, DownOutlined, ExportOutlined } from '@ant-design/icons'
import { ProSearch, ProSearchMore } from '@/components/ProSearch'
import { DialogForm } from '@/components/dialog'
import type { Dayjs } from 'dayjs'
import {
  Input,
  DatePicker,
  Select,
  message,
  Dropdown,
  Col,
  Modal,
  Image,
  Form,
  Table,
  type TableProps,
  Space,
  Button,
  Radio,
  Tag
} from 'antd'
import styles from './List.module.less'
import { exportStatusList } from '@/constant/productManage/dict'
import type { MenuProps } from 'antd'
import type { TableDataType, SearchParams } from '@/types/storeManage/product'
import { getProductReleaseList } from '@/api/product'
import { SelectCategory } from '@/components/SelectCategory'
const { RangePicker } = DatePicker

const List: FC = () => {
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState<TableDataType[]>([])
  const [tableTotal, setTableTotal] = useState<number>(0)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedRows, setSelectedRows] = useState<TableDataType[]>([])
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    size: 10,
    keyId: '', // 成品编码
    productName: '', // 商品名称
    createByName: '', // 素材名称
    dateTimeRange: [], // 创建时间
    createTime: '', // 创建时间
    releaseStatus: '', // 汇出状态
    categoryId: [] // 商品分类
  })
  const dropDownItems: MenuProps['items'] = [
    {
      label: '批量删除',
      key: '1'
    }
  ]
  const getStoreName = (list: { storeTitle: string }[]) => {
    return list.map((item: { storeTitle: string }) => `${item.storeTitle}`).join('、')
  }

  const columns: ColumnsType<TableDataType> = [
    {
      title: '成品信息',
      dataIndex: 'images',
      align: 'center',
      sorter: false,
      render: (_, record: any) => {
        return <Image width={200} src={record.images[0].url} />
      }
    },
    {
      title: '商品「分类」',
      dataIndex: 'categoryName',
      align: 'center',
      render: (_, record: any) => {
        return <span>{record.categoryName}</span>
      }
    },
    {
      title: '商品属性',
      dataIndex: 'variant',
      align: 'center',
      render: (_, record: any) => {
        return (
          <>
            <div className='flex'>颜色：{record.variant?.length ? record.variant[0].color : record.color}</div>
            <div className='flex'>尺码：{record.variant?.length ? record.variant[0].size : record.size}</div>
          </>
        )
      }
    },
    {
      title: '已汇出店铺',
      dataIndex: 'releaseStoreList',
      align: 'center',
      render: (_, record: any) => {
        if (record.releaseStoreList && record.releaseStoreList.length > 0) {
          return (
            <>
              <span>{getStoreName(record.releaseStoreList)}</span>
            </>
          )
        }
      }
    },
    {
      title: '设计账号',
      dataIndex: 'createByName',
      align: 'center',
      render: (_, record: any) => <span>{record.createByName}</span>
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      align: 'center',
      render: (_, record: any) => (
        <div className='flex flex-col items-start'>
          <div className='flex'>创建：{record.createTime}</div>
          <div className='flex'>更新：{record.updateTime || '-'}</div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 220,
      render: (_, record: any) => (
        <Space>
          {/* <DialogForm
            params={{ act: 'update', id: record.id }}
            isDrawer
            component={}
            title='编辑店铺'
            width='700px'
            onOkCallback={fetchData}
          >
            <Button type='link'>编辑</Button>
          </DialogForm> */}

          <Button type='link' danger onClick={() => handleDelete(record)}>
            删除
          </Button>
          <Button type='link' danger onClick={() => handleDownload(record)}>
            下载效果图
          </Button>
          <Button type='link' onClick={() => handleView(record)}>
            查看SKU
          </Button>
        </Space>
      )
    }
  ]

  useEffect(() => {
    fetchData()
  }, [searchParams])

  async function fetchData() {
    setTableLoading(true)
    const { dateTimeRange, ...restParams } = searchParams
    const data = await getProductReleaseList(restParams)
    const { records, total } = data as any
    setTableData(records)
    setTableTotal(total)
    setTableLoading(false)
  }
  function handlePageChange(page: number, pageSize: number) {
    setSearchParams({ ...searchParams, page, size: pageSize })
  }
  const handleDownload = (record: TableDataType) => {
    console.log(record)
  }

  const handleDelete = (record: TableDataType) => {
    console.log(record)
  }
  //   查看sku
  const handleView = (record: TableDataType) => {}

  const handleSearch = (params: any) => {
    if (params.createTime && Array.isArray(params.createTime)) {
      const [start, end] = params.createTime as [Dayjs, Dayjs]
      params.createTime = `${start.format('YYYY-MM-DD')},${end.format('YYYY-MM-DD')}`
    }

    setSearchParams({ ...searchParams, ...params })
  }

  const handleReset = () => {
    setSearchParams({
      page: 1,
      size: 10,
      keyId: '', // 成品编码
      productName: '', // 商品名称
      createByName: '', // 素材名称
      dateTimeRange: [], // 创建时间
      createTime: '', // 创建时间
      releaseStatus: '', // 汇出状态
      categoryId: [] // 商品分类
    })
  }
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch({ ...searchParams, productName: e.currentTarget.value })
    }
  }
  // 关键点：这个函数既作为回调函数，也能手动调用～
  const handleChange = (selectedRowKeys: any[], selectedRows: TableDataType[]) => {
    setSelectedItems([...selectedRowKeys])
    setSelectedRows([...selectedRows])
  }

  const tableSelection: TableProps<any>['rowSelection'] = {
    selectedRowKeys: selectedItems,
    onChange: handleChange
  }
  // 全部选择
  const handleSelectAll = () => {
    const tempList: string[] = []
    tableData.forEach((item, index) => {
      // 遍历，和全部的 tableData 作对比，找到没有勾选的 row, 将它的 key 值保存到 selectedRowKeys 数组
      if (!selectedItems.includes(item.id)) {
        tempList.push(item.id)
      }
    })
    // 手动修改 selectedRowKeys，和 Table 组件内的 selectedRowKeys 联动
    handleChange(tempList, [...tableData])
  }
  // 全部取消选择
  const handleClearSelected = () => {
    setSelectedItems([])
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
          <Form.Item label='成品名称' name='productName'>
            <Input placeholder='请输入成品名称' allowClear onKeyPress={handleKeyPress} />
          </Form.Item>
        </Col>

        <Col md={8} sm={24}>
          <Form.Item label='成品编码' name='keyId'>
            <Input placeholder='请输入成品编码' allowClear onKeyPress={handleKeyPress} />
          </Form.Item>
        </Col>
        <Col md={8} sm={24}>
          <Form.Item label='汇出状态' name='releaseStatus'>
            <Radio.Group>
              {exportStatusList.map(item => {
                return (
                  <Radio value={item.value} key={item.value}>
                    {item.label}{' '}
                  </Radio>
                )
              })}
            </Radio.Group>
          </Form.Item>
        </Col>

        {/* 更多搜索项 - 使用 ProSearchMore 组件 */}
        <ProSearchMore>
          <Col md={8} sm={24}>
            <Form.Item label='商品分类' name='categoryId'>
              <SelectCategory value={searchParams.categoryId}></SelectCategory>
            </Form.Item>
          </Col>
          <Col md={8} sm={24}>
            <Form.Item label='设计账号' name='createByName'>
              <Input placeholder='请输入' allowClear onKeyPress={handleKeyPress} />
            </Form.Item>
          </Col>

          <Col md={8} sm={24}>
            <Form.Item label='创建时间' name='dateTimeRange'>
              <RangePicker
                style={{ width: '100%' }}
                showTime
                format='YYYY-MM-DD HH:mm:ss' // 改成字符串
                placeholder={['开始时间', '结束时间']}
              />
            </Form.Item>
          </Col>
        </ProSearchMore>
      </ProSearch>
      <div className={styles['md-action-row']}>
        <Dropdown menu={{ items: dropDownItems }} placement='bottomLeft'>
          <Button type='primary' icon={<DownOutlined />}>
            批量操作
          </Button>
        </Dropdown>
        <Button type='primary' icon={<ExportOutlined />}>
          汇出
        </Button>
        <Button type='link' onClick={handleSelectAll}>
          全部选择
        </Button>
        <Button type='text'>已经选择{selectedItems.length}个</Button>
        <Button type='link' onClick={handleClearSelected}>
          清空已选
        </Button>
      </div>
      {/* 表格查询 */}
      <Table
        rowKey='id'
        rowSelection={tableSelection}
        columns={columns}
        dataSource={tableData}
        loading={tableLoading}
        pagination={{
          current: searchParams.page,
          pageSize: searchParams.size,
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

export default List

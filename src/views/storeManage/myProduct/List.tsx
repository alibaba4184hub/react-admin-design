import { type FC, useState, useEffect } from 'react'
import type { ColumnsType } from 'antd/es/table'
import { ExclamationCircleOutlined, RightOutlined, DownOutlined, ExportOutlined } from '@ant-design/icons'
import { ProSearch, ProSearchMore } from '@/components/ProSearch'
import { DialogForm } from '@/components/dialog'
import type { Dayjs } from 'dayjs'
import classNames from 'classnames'
import EditProduct from './EditProduct'
import {
  Input,
  DatePicker,
  message,
  Popover,
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
import { getProductReleaseList, delProductRelease, downloadProductImages } from '@/api/product'
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
      align: 'left',
      sorter: false,
      render: (_, record: any) => {
        return (
          <div className='flex items-center'>
            <Popover
              trigger='click'
              placement='rightTop'
              title={'图片预览'}
              content={
                <>
                  <Image width={260} preview={false} height={'auto'} src={record.images[0].url} />
                  <div className={styles['md-action-row']}>
                    <Button type='link' iconPosition={'end'} icon={<RightOutlined />}>
                      查看效果图
                    </Button>
                    <Button type='link' iconPosition={'end'} icon={<RightOutlined />}>
                      查看SKU
                    </Button>
                  </div>
                </>
              }
            >
              <Image width={120} height={150} preview={false} src={record.images[0].url} />
            </Popover>
            <div className={classNames(styles['product-msg'], 'flex-col items-start justify-between ml-15')}>
              <div>
                <div className='flex'>{record.productName || '-'}</div>
                <div className={classNames(styles['gray'], 'text-14')}>{record.productEnglishName || '-'}</div>
                <span className={classNames(styles['gray'], 'text-12 mt-10')}>成品编码：{record.keyId}</span>
              </div>
              {record.categories && record.categories.length > 0 && (
                <div className='ys-product-tag mt-20 flex flex-wrap'>
                  {record.categories.map((item: { id: string; name: string }) => {
                    return (
                      <Tag
                        className={classNames('mr-10 mb-5', styles['tag-content'])}
                        color='orange'
                        key={item.id}
                        title={item.name}
                      >
                        {item.name}
                      </Tag>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      }
    },
    {
      title: '商品「分类」',
      dataIndex: 'categoryName',
      align: 'left',
      width: 120,
      render: (_, record: any) => {
        return <span>{record.categoryName}</span>
      }
    },
    {
      title: '商品属性',
      dataIndex: 'variant',
      align: 'left',
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
      align: 'left',
      width: 120,
      render: (_, record: any) => <span>{record.createByName}</span>
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      align: 'left',
      width: 220,
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
        <Space className='flex flex-col items-center'>
          <DialogForm
            params={{ act: 'update', id: record.id, rowData: record }}
            isDrawer={false}
            component={EditProduct}
            title='编辑商品'
            width='700px'
            onOkCallback={fetchData}
          >
            <Button type='link'>编辑</Button>
          </DialogForm>

          <Button type='link' danger onClick={() => handleDelete(record)}>
            删除
          </Button>
          <Button type='link' onClick={() => handleDownload(record)}>
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
  /**
   * 将 Blob 转换为 JSON 对象
   * @param blob 要转换的 Blob 对象
   * @returns 解析后的 JSON 对象
   */
  function blobToJson<T = any>(blob: Blob): Promise<T> {
    return new Promise((resolve, reject) => {
      // 1. 前置校验：确保是有效的 Blob
      if (!(blob instanceof Blob)) {
        reject(new Error('参数不是有效的 Blob 对象'))
        return
      }

      // 2. 校验 Blob 类型
      if (blob.type && !blob.type.includes('json') && !blob.type.includes('text')) {
        console.warn(`Blob 类型为 ${blob.type}，可能不是 JSON 数据`)
      }

      // 4. 检查是否为空的 Blob
      if (blob.size === 0) {
        resolve(null as any) // 或返回空对象 {}，根据业务需求
        return
      }

      const reader = new FileReader()

      reader.onload = () => {
        try {
          const result = reader.result

          // 结果只能是 string 或 null
          if (typeof result !== 'string') {
            // 如果 result 是 null，尝试其他方式读取
            if (result === null) {
              // 尝试将整个 Blob 作为简单对象返回
              resolve({
                code: 0,
                message: 'success',
                blobInfo: {
                  size: blob.size,
                  type: blob.type,
                  name: blob instanceof File ? (blob as File).name : 'blob'
                }
              } as any)
              return
            }

            // 理论上不会走到这里，但为了安全
            reject(new Error('读取结果类型异常'))
            return
          }

          const text = result

          // 5. 基础文本校验
          if (text.trim() === '') {
            resolve(null as any)
            return
          }

          // 6. 尝试解析 JSON
          try {
            const json = JSON.parse(text)
            resolve(json)
          } catch (parseError: any) {
            // 7. 如果不是标准 JSON，返回文本或结构化数据
            if (text.startsWith('{') || text.startsWith('[')) {
              // 看起来像 JSON 但解析失败
              reject(new Error(`JSON 解析失败: ${parseError.message}`))
            } else {
              // 不是 JSON，返回文本内容
              resolve({
                code: 0,
                message: 'success',
                data: text,
                isPlainText: true,
                blobInfo: {
                  size: blob.size,
                  type: blob.type
                }
              } as any)
            }
          }
        } catch (e) {
          reject(e)
        }
      }

      reader.onerror = errorEvent => {
        reject(new Error(`文件读取失败: ${reader.error?.message || '未知错误'}`))
      }

      // 添加超时处理
      const timeoutId = setTimeout(() => {
        reader.abort()
        reject(new Error('读取超时'))
      }, 30000) // 30秒超时

      reader.onloadend = () => {
        clearTimeout(timeoutId)
      }

      // 开始读取
      reader.readAsText(blob)
    })
  }
  const downloadBlob = async (content: any, fileName: string) => {
    // 创建一个新的Blob对象，其内容为传入的Blob对象的内容
    try {
      const blob = new Blob([content])
      const result = await blobToJson(blob)
      if (result.code !== 0) {
        message.error(result.message)
        return false
      }
      // 创建一个隐藏的a元素，用于模拟点击下载文件
      const a = document.createElement('a')
      // 设置下载的文件名为传入的fileName
      a.download = fileName
      // 将a元素隐藏起来
      a.style.display = 'none'
      // 将Blob对象转换为URL，作为a元素的href属性，实现下载功能
      a.href = URL.createObjectURL(blob)
      // 将a元素添加到文档的body中
      document.body.appendChild(a)
      // 模拟点击a元素，触发浏览器的下载功能
      a.click()
      // 释放URL.createObjectURL()创建的URL对象，避免内存泄漏
      URL.revokeObjectURL(a.href)
      // 从文档的body中移除a元素
      document.body.removeChild(a)

      return true
    } catch (error: any) {
      console.error('batch download is error:', error)
      message.error(error.message)
    }
  }
  const handleDownload = async (record: TableDataType) => {
    try {
      const data = await downloadProductImages({ id: record.id })
      const result = await downloadBlob(data, `${record?.productName}-效果图.zip`)
      if (!result) {
        message.error('导出失败')
        return
      }
    } catch (error) {}
  }
  //  删除商品
  const handleDelete = (record: TableDataType) => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: (
        <>
          <div>确认删除成品？</div>
          <div style={{ marginTop: '10px', textAlign: 'left' }}>
            <p>1、删除成品后，将无法编辑和汇出成品，请谨慎操作；</p>
            <p>2、删除成功后，其关联订单需要重新关联其他成品。</p>
          </div>
        </>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        // 调用删除接口
        try {
          await delProductRelease({ ids: [record.id] })
          message.success('删除成功')
          fetchData()
        } catch (error) {
          console.log('delete is error:', error)
        }
      }
    })
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

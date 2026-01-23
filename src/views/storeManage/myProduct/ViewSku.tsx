// SkuImageTable.tsx
import React, { useMemo, forwardRef } from 'react'
import { Table, Image } from 'antd'
import type { TableProps } from 'antd'

// 类型定义
export interface SkuItem {
  images: { url: string }[]
  color: string
  size: string
  code: string
  [key: string]: any
}

export interface SkuTableProps {
  /** SKU 数据列表 */
  data?: SkuItem[]
  /** 自定义样式 */
  className?: string
  /** 是否显示边框 */
  bordered?: boolean
  /** 行高 */
  rowHeight?: number
  /** 图片宽度 */
  imageWidth?: number
  /** 图片高度 */
  imageHeight?: number
}

const SkuImageTable: React.FC<SkuTableProps> = forwardRef((props, ref) => {
  const { data = [], className = '', bordered = true, rowHeight = 80, imageWidth = '100%', imageHeight = 80 } = props

  // 计算合并行数
  // 优化1：预处理每个行的合并信息（起始索引、合并行数）
  const getRowMergeInfo = useMemo(() => {
    const colorCount: Record<string, number> = {}
    const mergeInfo: Array<{
      startIndex: number // 该颜色分组的起始行索引
      endIndex: number // 该颜色分组的结束行索引
      span: number // 合并行数
      color: string
    }> = []

    // 第一步：统计每个颜色的行数
    data.forEach(item => {
      colorCount[item.color] = (colorCount[item.color] || 0) + 1
    })

    // 第二步：计算每个颜色分组的起始/结束索引
    let currentIndex = 0
    Object.entries(colorCount).forEach(([color, count]) => {
      mergeInfo.push({
        startIndex: currentIndex,
        endIndex: currentIndex + count - 1,
        span: count,
        color
      })
      currentIndex += count
    })

    // 第三步：为每一行映射对应的合并信息
    return data.map((row, rowIndex) => {
      const target = mergeInfo.find(item => item.color === row.color)
      return {
        isFirstRow: rowIndex === target?.startIndex, // 是否是该分组的第一行
        span: target?.span || 1 // 合并行数
      }
    })
  }, [data])

  // 使用第三种方法（基于图片URL合并）
  const activeMergeInfo = getRowMergeInfo

  // 定义表格列
  const columns = useMemo(() => {
    const columnsConfig: TableProps<SkuItem>['columns'] = [
      {
        title: '商品',
        dataIndex: 'images',
        key: 'images',
        width: 120,
        align: 'center',
        render: (images: SkuItem['images'], record: SkuItem, index: number) => {
          const imageUrl = images?.[0]?.url
          if (!imageUrl) {
            return (
              <div
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}
              >
                暂无图片
              </div>
            )
          }

          return (
            <Image
              src={imageUrl}
              width={imageWidth}
              height='auto'
              style={{
                objectFit: 'contain',
                borderRadius: '4px'
              }}
              alt='商品图片'
              preview={false}
            />
          )
        },
        onCell: (record: SkuItem, rowIndex?: number) => {
          if (rowIndex === undefined) return {}

          // 检查是否有合并信息
          if (!activeMergeInfo[rowIndex]) {
            return {
              rowSpan: 1,
              colSpan: 1
            }
          }

          const currentMerge = activeMergeInfo[rowIndex]

          // 仅处理第一列（颜色列）的合并
          if (currentMerge.isFirstRow) {
            // 第一行显示，设置合并行数
            return {
              rowspan: currentMerge.span,
              colspan: 1,
              style: {
                verticalAlign: 'middle',
                backgroundColor: '#f9f9f9'
              }
            }
          } else {
            // 非第一行隐藏（rowspan/colspan设为0）
            return {
              rowSpan: 0,
              colSpan: 0,
              style: { display: 'none' }
            }
          }
        }
      },
      {
        title: '颜色',
        dataIndex: 'color',
        key: 'color',
        width: 100,
        align: 'center' as const,
        render: (text: string) => (
          <div
            style={{
              fontWeight: 500,
              color: '#1890ff',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: '#e6f7ff'
            }}
          >
            {text}
          </div>
        )
      },
      {
        title: '尺码',
        dataIndex: 'size',
        key: 'size',
        width: 100,
        align: 'center' as const,
        render: (text: string) => (
          <span
            style={{
              fontWeight: 600,
              color: '#52c41a',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: '#f6ffed'
            }}
          >
            {text}
          </span>
        )
      },
      {
        title: 'SKU',
        dataIndex: 'keyId',
        key: 'keyId',
        align: 'center' as const,
        render: (text: string) => <span>{text}</span>
      }
    ]

    return columnsConfig
  }, [activeMergeInfo, imageWidth, imageHeight])

  // 表格配置
  const tableProps: TableProps<SkuItem> = {
    columns,
    dataSource: data.map((item, index) => ({
      ...item,
      key: index,
      rowIndex: index
    })),
    bordered,
    pagination: false,
    rowKey: 'key',
    scroll: { x: 'max-content' },
    size: 'middle',
    rowClassName: (record, index) => {
      return index! % 2 === 0 ? 'even-row' : 'odd-row'
    }
  }

  return (
    <div className={`sku-image-table-container ${className}`}>
      <Table<SkuItem>
        {...tableProps}
        onRow={(record, index) => ({
          style: {
            height: `${rowHeight}px`,
            backgroundColor: index! % 2 === 0 ? '#ffffff' : '#fafafa'
          }
        })}
        locale={{ emptyText: '暂无数据' }}
      />
    </div>
  )
})

SkuImageTable.displayName = 'SkuImageTable'

export default SkuImageTable

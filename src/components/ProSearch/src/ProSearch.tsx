// ProSearch.tsx - 简化版本，使用 context
import React, { useState, useEffect, useRef, createContext, useContext } from 'react'
import { Form, Row, Col, Button, FormInstance, RowProps, FormProps, ColProps } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import './Prosearch.less'

interface ProSearchContextType {
  expand: boolean
}

const ProSearchContext = createContext<ProSearchContextType>({
  expand: false
})

export const ProSearchMore: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { expand } = useContext(ProSearchContext)

  if (!expand) return null

  return <>{children}</>
}

export interface ProSearchProps {
  /** 标签宽度 */
  labelWidth?: number | string
  /** 是否支持更多查询 */
  moreQuery?: boolean
  /** 布局模式：flex - 标签宽度自适应左对齐；block - 标签宽度通过labelWidth设置，文本右对齐 */
  mode?: 'flex' | 'block'
  /** 是否显示内置的查询、重置按钮 */
  showSearchAction?: boolean
  /** 表单布局，同 antd Form 的 layout */
  layout?: FormProps['layout']
  /** 搜索回调 */
  onSearch?: (params: any) => void
  /** 重置回调 */
  onReset?: () => void
  /** 所有子元素（包括默认和更多搜索） */
  children?: React.ReactNode
  /** 自定义样式类名 */
  className?: string
  /** Row 的 gutter 配置 */
  gutter?: RowProps['gutter']
  /** 操作栏的 span 配置 */
  actionsSpan?: ColProps['span']
}
type ProSearchComponent = React.FC<ProSearchProps> & {
  More: typeof ProSearchMore
}

const ProSearch: ProSearchComponent = props => {
  const {
    labelWidth = 80,
    moreQuery = false,
    mode = 'block',
    showSearchAction = true,
    layout = 'horizontal',
    onSearch,
    onReset,
    children,
    className = '',
    gutter = 24,
    actionsSpan
  } = props

  const [form] = Form.useForm()
  const [expand, setExpand] = useState(false)
  const [computedActionsSpan, setComputedActionsSpan] = useState<number>(8)
  const searchRowRef = useRef<HTMLDivElement>(null)

  // 处理高级搜索展开/收起
  const handleSeniorSearch = () => {
    setExpand(!expand)
  }

  // 处理搜索
  const handleSearch = async () => {
    // 验证表单
    try {
      const values = await form.validateFields()
      onSearch?.(values)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  // 处理重置
  const handleClear = () => {
    form.resetFields()
    onReset?.()
  }

  // 根据元素数量计算操作栏的 span
  // ProSearch.tsx - 简单方案
  const setSpanByElemCount = () => {
    if (!searchRowRef.current) return

    // 获取 Row 的直接子元素（Col 元素）
    const rowElement = searchRowRef.current
    // 排除操作栏本身（最后一个元素）
    const colElements = Array.from(rowElement.children).filter(
      (el, index, arr) => index < arr.length - 1 // 排除最后一个（操作栏）
    )

    // 计算可见的表单项数量
    let visibleFormItemCount = 0

    React.Children.forEach(children, child => {
      if (React.isValidElement(child)) {
        if (child.type === ProSearchMore) {
          if (expand) {
            // 展开时，ProSearchMore 的子元素数量
            visibleFormItemCount += React.Children.count(child.props.children)
          }
        } else {
          // 其他直接子元素
          visibleFormItemCount++
        }
      }
    })

    console.log('可见表单项数量:', visibleFormItemCount)

    // 根据总数量计算
    const totalVisibleItems = visibleFormItemCount

    if (totalVisibleItems % 3 === 0) {
      setComputedActionsSpan(24)
    } else if (totalVisibleItems % 3 === 1) {
      setComputedActionsSpan(16)
    } else {
      setComputedActionsSpan(8)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setSpanByElemCount()
    }, 0)

    return () => clearTimeout(timer)
  }, [expand, children])

  // 表单标签对齐方式
  const labelAlign = mode === 'flex' ? 'left' : 'right'

  // 表单样式
  const formClassName = mode === 'flex' ? 'pro-advanced-search-form' : 'pro-advanced-block-search-form'

  // 操作栏样式
  const actionsStyles: React.CSSProperties = moreQuery
    ? {
        textAlign: 'right'
      }
    : {}

  return (
    <ProSearchContext.Provider value={{ expand }}>
      <div className={`${formClassName} ${className}`}>
        <Form
          form={form}
          layout={layout}
          labelAlign={labelAlign}
          labelCol={mode === 'block' ? { style: { width: labelWidth } } : undefined}
          wrapperCol={mode === 'block' ? { style: { flex: 1 } } : undefined}
        >
          <Row gutter={gutter} justify='start' className='pro-search-row' ref={searchRowRef}>
            {/* 所有子元素，ProSearchMore 会根据 expand 状态显示/隐藏 */}
            {children}

            {/* 操作按钮栏 */}
            {showSearchAction && (
              <Col className='pro-search-action' md={actionsSpan || computedActionsSpan} sm={24} style={actionsStyles}>
                <Form.Item label='' colon={false} className='btn-box-more'>
                  <Button type='primary' onClick={handleSearch}>
                    搜索
                  </Button>
                  <Button onClick={handleClear} style={{ marginLeft: 8 }}>
                    重置
                  </Button>
                  {moreQuery && (
                    <span
                      className='margin-left-8 ui-color-link-light'
                      onClick={handleSeniorSearch}
                      style={{ cursor: 'pointer', marginLeft: 8 }}
                    >
                      {expand ? '收起' : '更多搜索'}
                      {expand ? <UpOutlined /> : <DownOutlined />}
                    </span>
                  )}
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </div>
    </ProSearchContext.Provider>
  )
}

// 导出 ProSearchMore 作为子组件
ProSearch.More = ProSearchMore

export default ProSearch

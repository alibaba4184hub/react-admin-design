// src/components/DialogForm/index.tsx
import React, { useState, useImperativeHandle, forwardRef, ReactNode, useEffect, useRef } from 'react'
import { Modal, Drawer, Button, ConfigProvider, message, Modal as AntModal } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import type { ModalProps, DrawerProps } from 'antd'

export interface DialogFormProps {
  /** 触发元素的样式类名 */
  className?: string
  /** 模态框样式类名 */
  dialogClassName?: string
  /** 传递给子组件的参数 */
  params?: Record<string, any>
  /** 模态框宽度 */
  width?: string | number
  /** 模态框标题 */
  title?: string
  /** 小标题（用于特定类型） */
  smTitle?: string
  /** 是否使用 Drawer 代替 Modal */
  isDrawer?: boolean
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否显示确认按钮 */
  showOnOk?: boolean
  /** 是否显示底部 */
  showFooter?: boolean
  /** 点击蒙层是否允许关闭 */
  maskClosable?: boolean
  /** 额外数据 */
  data?: Record<string, any>
  /** 模态框内容区域样式 */
  bodyStyle?: React.CSSProperties
  /** 触发元素样式 */
  style?: React.CSSProperties
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 组件类型 */
  type?: 'normal' | 'gallery' | 'galleryVideo'
  /** 确认按钮文本 */
  okText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 层级 */
  zIndex?: number
  /** 禁用时的提示信息 */
  tip?: string
  /** 子组件路径（React 中使用动态导入） */
  path?: string
  /** 子组件（React 中直接传递组件） */
  children?: ReactNode
  /** 动态加载的组件 */
  component?: React.ComponentType<any>
  /** 确认回调 */
  onOkCallback?: (result: any, data?: Record<string, any>) => void
  /** 通用回调 */
  onCallback?: (result: any, data?: Record<string, any>) => void
  /** 关闭回调 */
  onCloseCallback?: () => void
  /** 触发元素内容 */
  trigger?: ReactNode
}

export interface DialogFormRef {
  show: () => void
  close: () => void
  onCloseConfirm: (value: boolean, text?: string) => void
}

const DialogForm = forwardRef<DialogFormRef, DialogFormProps>((props, ref) => {
  const {
    className = '',
    dialogClassName = '',
    params = {},
    width = '800px',
    title = '',
    smTitle = '',
    isDrawer = false,
    showClose = true,
    showOnOk = true,
    showFooter = true,
    maskClosable = true,
    data = {},
    bodyStyle = {},
    style,
    showHeader = true,
    disabled = false,
    type = 'normal',
    okText = '确认',
    cancelText = '取消',
    zIndex = 1002,
    tip = '',
    children,
    component: Component,
    onOkCallback,
    onCallback,
    onCloseCallback,
    trigger
  } = props

  // 状态
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [okDisabled, setOkDisabled] = useState(false)
  const [closeConfirm, setCloseConfirm] = useState(false)
  const [closeConfirmText, setCloseConfirmText] = useState('退出后，当前修改的内容不会被保存')

  // 子组件引用
  const submitFormRef = useRef<any>(null)

  // 计算属性
  const computedWidth = type === 'gallery' || type === 'galleryVideo' ? '811px' : width
  const computedTitle = showHeader
    ? type === 'gallery' || type === 'galleryVideo'
      ? smTitle || getTitleByType(type)
      : title
    : null
  const computedClassName = `${dialogClassName} ${
    type === 'gallery' || type === 'galleryVideo' ? 'lyecs-modal-gallery noPadding' : ''
  }`

  // 根据类型获取标题
  function getTitleByType(type: string) {
    switch (type) {
      case 'gallery':
        return '图片相册'
      case 'galleryVideo':
        return '视频相册'
      default:
        return title
    }
  }

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    show: () => {
      handleShow()
    },
    close: () => {
      handleClose()
    },
    onCloseConfirm: (value: boolean, text?: string) => {
      setCloseConfirm(value)
      if (text) {
        setCloseConfirmText(text)
      }
    }
  }))

  // 显示模态框
  const handleShow = (e?: React.MouseEvent) => {
    if (disabled) {
      if (tip) {
        message.error(tip)
      }
      return
    }

    if (e) {
      e.stopPropagation()
    }

    setConfirmLoading(false)
    setLoaded(true)
    setVisible(true)
  }

  // 关闭模态框
  const handleClose = (e?: React.SyntheticEvent<Element, Event>) => {
    if (e) {
      e.stopPropagation()
    }

    if (closeConfirm) {
      setVisible(true)
      AntModal.confirm({
        title: '退出当前编辑？',
        icon: <ExclamationCircleOutlined />,
        content: <div style={{ color: 'red' }}>{closeConfirmText}</div>,
        onOk: () => {
          setVisible(false)
          setCloseConfirm(false)
        },
        onCancel: () => {
          console.log('Cancel')
        }
      })
      return
    }

    setVisible(false)
    onCloseCallback?.()
  }

  // 确认提交
  const handleOk = () => {
    // 执行子组件的表单提交方法
    if (submitFormRef.current?.onFormSubmit) {
      submitFormRef.current.onFormSubmit()
    } else {
      console.warn('子组件未实现 onFormSubmit 方法')
      // 如果没有实现 onFormSubmit，直接调用提交回调
      submitCallback({})
    }
  }

  // 提交回调
  const submitCallback = (result: any, isClose = true) => {
    if (isClose) {
      setVisible(false)
    }
    setConfirmLoading(false)
    onOkCallback?.(result, data)
  }

  // 通用回调
  const handleCallback = (result: any) => {
    onCallback?.(result, data)
  }

  // 确定按钮状态变化
  const handleOkType = (type: boolean) => {
    setOkDisabled(!type)
  }

  // 关闭确认设置
  const handleCloseConfirm = (value: boolean, text?: string) => {
    setCloseConfirm(value)
    if (text) {
      setCloseConfirmText(text)
    }
  }

  // 传递给子组件的参数
  const childParams = {
    ...params,
    isDialog: true,
    visible,
    submitCallback,
    callback: handleCallback,
    show: handleShow,
    close: handleClose,
    okType: handleOkType,
    closeConfirm: handleCloseConfirm,
    confirmLoading,
    setConfirmLoading
  }

  // 渲染触发元素
  const renderTrigger = () => {
    if (!trigger && !children) return null

    return (
      <div
        className={`dialog-link ${className}`}
        style={{
          display: 'inline-flex',
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...style
        }}
        onClick={handleShow}
      >
        {trigger || children}
      </div>
    )
  }

  // 底部按钮
  const renderFooter = () => {
    if (!showFooter) return null

    return (
      <div style={{ textAlign: 'right' }}>
        {showClose && (
          <Button style={{ marginRight: 8 }} onClick={handleClose}>
            {cancelText}
          </Button>
        )}
        {showOnOk && (
          <Button type='primary' disabled={okDisabled} loading={confirmLoading} onClick={handleOk}>
            {okText}
          </Button>
        )}
      </div>
    )
  }

  // 动态加载的组件
  const DynamicComponent = React.useMemo(() => {
    if (!Component) {
      return () => <div>请传递 component 属性</div>
    }

    // 包装组件以确保支持 ref
    return React.forwardRef((props: any, ref) => {
      // 检查组件是否已经是 forwardRef 包装的
      const Comp = Component as any
      return <Comp {...props} ref={ref} />
    })
  }, [Component])

  // 模态框公共属性
  const modalProps: ModalProps | DrawerProps = {
    open: visible,
    onCancel: handleClose,
    onClose: handleClose,
    confirmLoading,
    width: computedWidth,
    maskClosable,
    title: computedTitle as any,
    destroyOnClose: true,
    // 替换 bodyStyle 为 styles
    ...(bodyStyle && {
      styles: {
        body: bodyStyle,
        zIndex
      }
    }),
    className: computedClassName,
    footer: renderFooter()
  }

  return (
    <>
      {renderTrigger()}
      {loaded &&
        (isDrawer ? (
          <Drawer {...(modalProps as DrawerProps)}>
            <ConfigProvider locale={zhCN}>
              <DynamicComponent ref={submitFormRef} {...childParams} />
            </ConfigProvider>
          </Drawer>
        ) : (
          <Modal {...(modalProps as ModalProps)} onOk={handleOk}>
            <ConfigProvider locale={zhCN}>
              <DynamicComponent ref={submitFormRef} {...childParams} />
            </ConfigProvider>
          </Modal>
        ))}
    </>
  )
})

DialogForm.displayName = 'DialogForm'

export default DialogForm

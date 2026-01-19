// src/components/DialogForm/dialog.ts
import React from 'react'
import ReactDOM from 'react-dom'
import FormModal from './src/FormModal'

export interface DialogOptions {
  /** 要显示的组件 */
  component: React.ComponentType<any>
  /** 传递给组件的参数 */
  params?: Record<string, any>
  /** 模态框标题 */
  title?: string
  /** 是否使用 Drawer */
  isDrawer?: boolean
  /** 宽度 */
  width?: string | number
  /** 样式类名 */
  className?: string
  /** 类型 */
  type?: 'normal' | 'gallery' | 'galleryVideo'
  /** 确认回调 */
  okCallback?: (result: any) => void
  /** 关闭后回调 */
  afterClose?: () => void
}

class DialogManager {
  private container: HTMLDivElement | null = null
  private instance: any = null

  /**
   * 显示对话框
   */
  show(options: DialogOptions) {
    // 清理之前的实例
    this.destroy()

    // 创建容器
    this.container = document.createElement('div')
    this.container.setAttribute('type', 'dialog')
    document.body.appendChild(this.container)

    // 渲染组件
    const element = React.createElement(FormModal, {
      ...options,
      ref: (ref: any) => {
        this.instance = ref
      }
    })

    ReactDOM.render(element, this.container)

    // 显示对话框
    setTimeout(() => {
      this.instance?.show()
    }, 0)
  }

  /**
   * 显示抽屉
   */
  drawer(options: DialogOptions) {
    this.show({
      ...options,
      isDrawer: true
    })
  }

  /**
   * 显示相册对话框
   */
  gallery(options: DialogOptions) {
    this.show({
      ...options,
      title: '相册',
      className: 'lyecs-modal-gallery',
      width: '811px',
      type: 'gallery'
    })
  }

  /**
   * 显示视频相册对话框
   */
  galleryVideo(options: DialogOptions) {
    this.show({
      ...options,
      title: '视频相册',
      className: 'lyecs-modal-gallery',
      width: '811px',
      type: 'galleryVideo'
    })
  }

  /**
   * 关闭当前对话框
   */
  close() {
    this.instance?.close()
  }

  /**
   * 销毁实例
   */
  private destroy() {
    if (this.container) {
      ReactDOM.unmountComponentAtNode(this.container)
      document.body.removeChild(this.container)
      this.container = null
    }
    this.instance = null
  }
}

// 创建全局实例
const dialog = new DialogManager()

export default dialog

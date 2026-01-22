// ProProgressBar.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { Modal } from 'antd'
import './ProProgressBar.less'
import iconSuccess from '../assets/icon-success.png'
import iconFail from '../assets/icon-fail.png'

// 默认配置
const DEFAULT_OPTIONS: ProgressBarOptions = {
  succColor: '#f12b25',
  failColor: '#f12b25',
  stripe: true,
  stripeColor: {
    successColor:
      'repeating-linear-gradient(-45deg, #ff8b46 25%, #ff6c2a 0, #ff6c2a 50%, #ff6c2a 0, #ff8b46 75%, #ff6c2a 0)',
    failColor:
      'repeating-linear-gradient(-45deg, #c8c8c8 25%, #b2b2b2 0, #b2b2b2 50%, #b2b2b2 0, #c8c8c8 75%, #b2b2b2 0)'
  },
  gradient: false,
  gradientColor: {
    successColor: 'linear-gradient(0deg, #FF6B48 0%, #FF9946 54%, #FFB944 100%)',
    failColor: 'linear-gradient(0deg, #A5A5A5 0%, #C0C0C0 54%, #D8D8D8 100%)'
  },
  transition: {
    widthSpeed: 200,
    opacitySpeed: 400,
    duration: 300
  },
  inverse: true,
  thickness: 18,
  autoFinish: true,
  autoLoad: true,
  autoLoadSpeed: 500,
  autoLoadStep: 8,
  autoLoadMaxPercent: 99
}
// 类型定义 - 保持不变...
interface StripeColor {
  successColor: string
  failColor: string
}

interface GradientColor {
  successColor: string
  failColor: string
}

interface Transition {
  widthSpeed: number
  opacitySpeed: number
  duration: number
}

export interface ProgressBarOptions {
  succColor: string
  failColor: string
  stripe: boolean
  stripeColor: StripeColor
  gradient: boolean
  gradientColor: GradientColor
  transition: Transition
  inverse: boolean
  thickness: number
  autoFinish: boolean
  autoLoad?: boolean
  autoLoadSpeed?: number
  autoLoadStep?: number
  autoLoadMaxPercent?: number
}

export interface ProProgressBarProps {
  options?: Partial<ProgressBarOptions>
  visible?: boolean
  percent?: number
  canSuccess?: boolean
  progressText?: string
  onClose?: () => void
  className?: string
  closable?: boolean
  maskClosable?: boolean
  autoLoad?: boolean
  autoLoadSpeed?: number
  autoLoadStep?: number
  autoLoadMaxPercent?: number
  onAutoLoadComplete?: () => void
}

// React 组件实现 - 保持不变...
const ProProgressBar: React.FC<ProProgressBarProps> = props => {
  const {
    options: propOptions = {},
    visible: propVisible = false,
    percent: propPercent = 0,
    canSuccess: propCanSuccess = true,
    progressText: propProgressText = '加载中...',
    onClose,
    className,
    closable = false,
    maskClosable = false,
    autoLoad: propAutoLoad = true,
    autoLoadSpeed: propAutoLoadSpeed,
    autoLoadStep: propAutoLoadStep,
    autoLoadMaxPercent: propAutoLoadMaxPercent,
    onAutoLoadComplete
  } = props

  // 合并配置
  const options = useMemo<ProgressBarOptions>(() => {
    const merged = {
      ...DEFAULT_OPTIONS,
      ...propOptions,
      autoLoad: propAutoLoad,
      autoLoadSpeed: propAutoLoadSpeed ?? propOptions.autoLoadSpeed ?? DEFAULT_OPTIONS.autoLoadSpeed,
      autoLoadStep: propAutoLoadStep ?? propOptions.autoLoadStep ?? DEFAULT_OPTIONS.autoLoadStep,
      autoLoadMaxPercent: propAutoLoadMaxPercent ?? propOptions.autoLoadMaxPercent ?? DEFAULT_OPTIONS.autoLoadMaxPercent
    }
    return merged
  }, [propOptions, propAutoLoad, propAutoLoadSpeed, propAutoLoadStep, propAutoLoadMaxPercent])

  const [visible, setVisible] = useState(propVisible)
  const [percent, setPercent] = useState(propPercent)
  const [canSuccess, setCanSuccess] = useState(propCanSuccess)
  const [progressText, setProgressText] = useState(propProgressText)
  const [isAutoLoading, setIsAutoLoading] = useState(false)
  const autoLoadTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 自动加载逻辑 - 保持不变...
  const startAutoLoad = useCallback(() => {
    if (!options.autoLoad || isAutoLoading || percent >= options.autoLoadMaxPercent!) return

    setIsAutoLoading(true)

    const step = () => {
      setPercent(prevPercent => {
        const nextPercent = Math.min(prevPercent + options.autoLoadStep!, options.autoLoadMaxPercent!)

        setProgressText(`加载中...`)

        if (nextPercent >= options.autoLoadMaxPercent!) {
          setIsAutoLoading(false)
          if (autoLoadTimerRef.current) {
            clearInterval(autoLoadTimerRef.current)
            autoLoadTimerRef.current = null
          }
          if (onAutoLoadComplete) {
            onAutoLoadComplete()
          }
        }

        return nextPercent
      })
    }

    step()

    autoLoadTimerRef.current = setInterval(step, options.autoLoadSpeed!)
  }, [
    options.autoLoad,
    options.autoLoadSpeed,
    options.autoLoadStep,
    options.autoLoadMaxPercent,
    isAutoLoading,
    percent,
    onAutoLoadComplete
  ])

  const stopAutoLoad = useCallback(() => {
    setIsAutoLoading(false)
    if (autoLoadTimerRef.current) {
      clearInterval(autoLoadTimerRef.current)
      autoLoadTimerRef.current = null
    }
  }, [])

  // 监听可见性变化
  useEffect(() => {
    if (visible && options.autoLoad) {
      startAutoLoad()
    } else {
      stopAutoLoad()
    }

    return () => {
      stopAutoLoad()
    }
  }, [visible, options.autoLoad, startAutoLoad, stopAutoLoad])

  // 更新外部 prop 变化
  useEffect(() => {
    setVisible(propVisible)
  }, [propVisible])

  useEffect(() => {
    setPercent(propPercent)
  }, [propPercent])

  useEffect(() => {
    setCanSuccess(propCanSuccess)
  }, [propCanSuccess])

  useEffect(() => {
    setProgressText(propProgressText)
  }, [propProgressText])

  // 计算样式 - 保持不变...
  const progressBarStyle = useMemo(() => {
    const { succColor, failColor, stripe, stripeColor, gradient, gradientColor, transition, inverse, thickness } =
      options
    const { widthSpeed, opacitySpeed } = transition

    const style: React.CSSProperties = {
      opacity: visible ? '1' : '0'
    }

    if (gradient && gradientColor.successColor) {
      style.background = canSuccess ? gradientColor.successColor : gradientColor.failColor
    } else if (stripe) {
      style.backgroundImage = canSuccess ? stripeColor.successColor : stripeColor.failColor
    } else {
      style.backgroundColor = canSuccess ? succColor : failColor
    }

    if (inverse) {
      style.left = '0'
    } else {
      style.right = '0'
    }

    style.width = `${percent}%`
    style.height = stripe ? `${thickness - 4}px` : `${thickness}px`
    style.borderRadius = `${thickness / 2}px`
    style.transition = `width ${widthSpeed}ms, opacity ${opacitySpeed}ms`

    return style
  }, [options, visible, canSuccess, percent])

  const statusPointStyle = useMemo(() => {
    const { inverse, thickness } = options
    const style: React.CSSProperties = {
      opacity: Math.round(percent) === 100 ? '0' : '1'
    }

    if (inverse) {
      style.left = `calc(${percent}% - ${thickness}px)`
    } else {
      style.right = `calc(${percent}% - ${thickness}px)`
    }

    return style
  }, [options, percent])

  // 处理关闭
  const handleClose = useCallback(() => {
    stopAutoLoad()
    setVisible(false)
    if (onClose) {
      onClose()
    }
  }, [onClose, stopAutoLoad])

  if (!visible) {
    return null
  }

  const showSuccessIcon = canSuccess && percent === 100
  const showFailIcon = !canSuccess && percent === 100

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      closable={closable}
      maskClosable={maskClosable}
      footer={null}
      width={600}
      centered
      className={`pro-progress-bar-modal ${className || ''}`}
    >
      <div className='bar-content'>
        <div
          className={`progress-bar-box ${options.stripe ? 'progress-bar-stripe' : options.gradient ? 'progress-bar-gradient' : ''}`}
          style={{
            height: `${options.thickness}px`,
            borderRadius: `${options.thickness / 2}px`
          }}
        >
          {options.stripe && <div className='progress-status-point' style={statusPointStyle}></div>}
          <div className='progress-bar' style={progressBarStyle}></div>
        </div>
        <div className='progress-text'>
          {showSuccessIcon && <img src={iconSuccess} className='icon-prefix' alt='成功' />}
          {showFailIcon && <img src={iconFail} className='icon-prefix' alt='失败' />}
          <span className='progress-tip'>{progressText}</span>
          {percent !== 100 && <span className='progress-percent'>{Math.round(percent)}%</span>}
          {isAutoLoading && percent < 100 && <span className='auto-load-indicator'>(自动加载中...)</span>}
        </div>
      </div>
    </Modal>
  )
}

// 命令式 API 实现
// 存储命令式 API 的状态
interface ProgressBarState {
  visible: boolean
  percent: number
  canSuccess: boolean
  progressText: string
  options: ProgressBarOptions
}

// 命令式 API 实例接口
export interface ProgressBarInstance {
  update: (config: {
    percent?: number
    canSuccess?: boolean
    progressText?: string
    options?: Partial<ProgressBarOptions>
    autoLoad?: boolean
    autoLoadSpeed?: number
    autoLoadStep?: number
    autoLoadMaxPercent?: number
  }) => void
  finish: (success?: boolean) => void
  fail: () => void
  startAutoLoad: () => void
  stopAutoLoad: () => void
  destroy: () => void
}

// 全局实例管理
let progressBarInstance: ProgressBarInstance | null = null
let container: HTMLDivElement | null = null
let root: ReactDOM.Root | null = null

// 创建命令式 API 的容器和根节点
const createContainer = () => {
  if (!container) {
    container = document.createElement('div')
    container.id = 'pro-progress-bar-container'
    document.body.appendChild(container)
  }
  if (!root) {
    root = ReactDOM.createRoot(container)
  }
  return { container, root }
}

// 移除容器
const removeContainer = () => {
  if (root) {
    root.unmount()
    root = null
  }
  if (container && document.body.contains(container)) {
    document.body.removeChild(container)
    container = null
  }
  progressBarInstance = null
}

// 命令式 API 创建函数
export const createProgressBar = (config?: Partial<ProProgressBarProps>): ProgressBarInstance => {
  // 如果已有实例，先销毁
  if (progressBarInstance) {
    progressBarInstance.destroy()
  }

  // 创建容器
  const { root } = createContainer()

  // 初始状态
  const initialState: ProgressBarState = {
    visible: true,
    percent: config?.percent || 0,
    canSuccess: config?.canSuccess ?? true,
    progressText: config?.progressText || '加载中...',
    options: {
      ...DEFAULT_OPTIONS,
      ...config?.options,
      autoLoad: config?.autoLoad ?? DEFAULT_OPTIONS.autoLoad,
      autoLoadSpeed: config?.autoLoadSpeed ?? config?.options?.autoLoadSpeed ?? DEFAULT_OPTIONS.autoLoadSpeed,
      autoLoadStep: config?.autoLoadStep ?? config?.options?.autoLoadStep ?? DEFAULT_OPTIONS.autoLoadStep,
      autoLoadMaxPercent:
        config?.autoLoadMaxPercent ?? config?.options?.autoLoadMaxPercent ?? DEFAULT_OPTIONS.autoLoadMaxPercent
    }
  }

  // 渲染组件
  const renderComponent = (state: ProgressBarState) => {
    const component = (
      <ProProgressBar
        visible={state.visible}
        percent={state.percent}
        canSuccess={state.canSuccess}
        progressText={state.progressText}
        autoLoad={state.options.autoLoad}
        autoLoadSpeed={state.options.autoLoadSpeed}
        autoLoadStep={state.options.autoLoadStep}
        autoLoadMaxPercent={state.options.autoLoadMaxPercent}
        options={state.options}
        onClose={() => {
          if (progressBarInstance) {
            progressBarInstance.destroy()
          }
        }}
        onAutoLoadComplete={() => {
          // 自动加载完成回调
        }}
      />
    )
    root!.render(component)
  }

  // 初始渲染
  renderComponent(initialState)

  // 存储当前状态
  let currentState = { ...initialState }
  let isMounted = true
  let autoLoadTimer: NodeJS.Timeout | null = null
  let isAutoLoading = false

  // 更新状态并重新渲染
  const updateState = (updater: (prev: ProgressBarState) => ProgressBarState) => {
    if (!isMounted) return
    currentState = updater(currentState)
    renderComponent(currentState)
  }

  // 自动加载函数
  const startAutoLoadInternal = () => {
    if (
      !currentState.options.autoLoad ||
      isAutoLoading ||
      currentState.percent >= currentState.options.autoLoadMaxPercent!
    )
      return

    isAutoLoading = true

    const step = () => {
      if (!isMounted || !isAutoLoading) return
      updateState(prev => {
        const newPercent = Math.min(prev.percent + prev.options.autoLoadStep!, prev.options.autoLoadMaxPercent!)
        return {
          ...prev,
          percent: newPercent,
          progressText: `加载中...`
        }
      })

      // 达到最大自动加载百分比
      if (currentState.percent >= currentState.options.autoLoadMaxPercent!) {
        stopAutoLoadInternal()
      }
    }

    // 立即执行一次
    step()
    //  先清楚定时器
    if (autoLoadTimer) {
      clearInterval(autoLoadTimer)
    }
    // 设置定时器
    autoLoadTimer = setInterval(step, currentState.options.autoLoadSpeed!)
  }

  const stopAutoLoadInternal = () => {
    isAutoLoading = false
    if (autoLoadTimer) {
      clearInterval(autoLoadTimer)
      autoLoadTimer = null
    }
  }

  // 更新函数
  const update: ProgressBarInstance['update'] = updateConfig => {
    if (!isMounted) return

    updateState(prev => {
      const newState = { ...prev }

      if (updateConfig.percent !== undefined) {
        newState.percent = updateConfig.percent
      }
      if (updateConfig.canSuccess !== undefined) {
        newState.canSuccess = updateConfig.canSuccess
      }
      if (updateConfig.progressText !== undefined) {
        newState.progressText = updateConfig.progressText
      }
      if (updateConfig.options) {
        newState.options = { ...newState.options, ...updateConfig.options }
      }
      if (updateConfig.autoLoad !== undefined) {
        newState.options.autoLoad = updateConfig.autoLoad
      }
      if (updateConfig.autoLoadSpeed !== undefined) {
        newState.options.autoLoadSpeed = updateConfig.autoLoadSpeed
      }
      if (updateConfig.autoLoadStep !== undefined) {
        newState.options.autoLoadStep = updateConfig.autoLoadStep
      }
      if (updateConfig.autoLoadMaxPercent !== undefined) {
        newState.options.autoLoadMaxPercent = updateConfig.autoLoadMaxPercent
      }

      return newState
    })

    // 如果开启自动加载且未达到最大值，重新开始自动加载
    if (
      currentState.options.autoLoad &&
      currentState.percent < currentState.options.autoLoadMaxPercent! &&
      !isAutoLoading
    ) {
      startAutoLoadInternal()
    }
  }

  // 完成函数
  const finish: ProgressBarInstance['finish'] = (success = true) => {
    if (!isMounted) return

    stopAutoLoadInternal()

    updateState(prev => ({
      ...prev,
      percent: 100,
      canSuccess: success,
      progressText: success ? '加载完成' : '加载失败'
    }))

    // 自动关闭
    if (currentState.options.autoFinish) {
      setTimeout(() => {
        destroy()
      }, 1000)
    }
  }

  // 失败函数
  const fail: ProgressBarInstance['fail'] = () => {
    finish(false)
  }

  // 开始自动加载
  const startAutoLoad: ProgressBarInstance['startAutoLoad'] = () => {
    startAutoLoadInternal()
  }

  // 停止自动加载
  const stopAutoLoad: ProgressBarInstance['stopAutoLoad'] = () => {
    stopAutoLoadInternal()
  }

  // 销毁函数
  const destroy: ProgressBarInstance['destroy'] = () => {
    if (!isMounted) return

    isMounted = false
    stopAutoLoadInternal()

    // 先隐藏，然后移除
    updateState(prev => ({ ...prev, visible: false }))

    setTimeout(() => {
      removeContainer()
    }, 500) // 等待动画完成
  }

  // 如果开启自动加载，开始自动加载
  if (currentState.options.autoLoad && currentState.percent < currentState.options.autoLoadMaxPercent!) {
    setTimeout(() => {
      startAutoLoadInternal()
    }, 100)
  }

  // 创建实例
  progressBarInstance = {
    update,
    finish,
    fail,
    startAutoLoad,
    stopAutoLoad,
    destroy
  }

  return progressBarInstance
}

// 默认导出一个命令式 API
export const proProgressBar = {
  start: (config?: Partial<ProProgressBarProps>) => createProgressBar(config),
  update: (config: Parameters<ProgressBarInstance['update']>[0]) => {
    if (progressBarInstance) {
      progressBarInstance.update(config)
    }
  },
  finish: (success?: boolean) => {
    if (progressBarInstance) {
      progressBarInstance.finish(success)
    }
  },
  fail: () => {
    if (progressBarInstance) {
      progressBarInstance.fail()
    }
  },
  startAutoLoad: () => {
    if (progressBarInstance) {
      progressBarInstance.startAutoLoad()
    }
  },
  stopAutoLoad: () => {
    if (progressBarInstance) {
      progressBarInstance.stopAutoLoad()
    }
  },
  destroy: () => {
    if (progressBarInstance) {
      progressBarInstance.destroy()
    }
  }
}

export default ProProgressBar

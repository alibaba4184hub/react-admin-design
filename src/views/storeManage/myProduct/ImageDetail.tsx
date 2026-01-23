import React, { useState, useEffect, forwardRef, useRef, useCallback } from 'react'
import { Image, Carousel, Button, Flex } from 'antd'
import { UpOutlined, DownOutlined } from '@ant-design/icons'
import type { CarouselRef } from 'antd/es/carousel'
import './ImageDetail.less'

interface ImageItem {
  url: string
}

interface ProductPicItem {
  id: string
  size: string
  color: string
  images: ImageItem[]
}

interface ProductImageViewerProps {
  productPicList: ProductPicItem[]
}

const ProductImageViewer: React.FC<ProductImageViewerProps> = forwardRef(({ productPicList = [] }) => {
  // 图片数据
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedValue, setSelectedValue] = useState<string>('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [filterImages, setFilterImages] = useState<ProductPicItem[]>([])

  // Refs
  const carouselRef = useRef<CarouselRef>(null)
  const scrollbarRef = useRef<any>(null)
  const thumbnailsWrapperRef = useRef<HTMLDivElement>(null)

  // 去重函数，根据color进行去重
  const removeDuplicate = useCallback((arr: ProductPicItem[]): ProductPicItem[] => {
    const result: ProductPicItem[] = []
    const map = new Map()
    for (const item of arr) {
      if (!map.has(item.color)) {
        map.set(item.color, item)
        result.push(item)
      }
    }
    return result
  }, [])

  // 颜色切换处理
  const handleColorChange = (value: string) => {
    const colorItem = filterImages.find(item => item.id === value)
    if (colorItem) {
      setImages(colorItem.images)
    }
    setSelectedValue(value)
    setActiveIndex(0)
    if (carouselRef.current) {
      carouselRef.current.goTo(0)
    }
  }

  // 计算是否滚动到最左
  const isAtLeft = activeIndex === 0

  // 计算是否滚动到最右
  const isAtRight = activeIndex === images.length - 1

  // 轮播图切换
  const handleCarouselChange = (current: number) => {
    setActiveIndex(current)
  }

  // 滚动控制
  const scroll = (direction: number) => {
    const newIndex = Math.max(0, Math.min(activeIndex + direction, images.length - 1))
    setActiveIndex(newIndex)
    scrollToThumbnail(newIndex)
    if (carouselRef.current) {
      carouselRef.current.goTo(newIndex)
    }
  }

  // 滚动到指定缩略图
  const scrollToThumbnail = (index: number) => {
    setActiveIndex(index)
    if (carouselRef.current) {
      carouselRef.current.goTo(index)
    }

    setTimeout(() => {
      // 第一层防护：确保 thumbnailsWrapper 已挂载
      if (!thumbnailsWrapperRef.current) return
      // 第二层防护：获取 container 并校验存在性
      const container = scrollbarRef.current?.nativeElement || scrollbarRef.current?.container?.firstChild
      if (!container) return
      // 第三层防护：校验目标元素有效性
      const targetItem = thumbnailsWrapperRef.current.children[index] as HTMLElement
      if (!targetItem) return
      // 安全执行滚动逻辑
      try {
        const containerHeight = container.clientHeight
        const itemHeight = targetItem.clientHeight
        const targetTop = targetItem.offsetTop - containerHeight / 2 + itemHeight / 2
        // 添加滚动范围校验
        const maxScroll = container.scrollHeight - containerHeight
        const safeTargetTop = Math.max(0, Math.min(targetTop, maxScroll))
        container.scrollTo({
          top: safeTargetTop,
          behavior: 'smooth'
        })
      } catch (error) {
        console.error('Scroll operation failed:', error)
      }
    }, 0)
  }

  // 初始化
  useEffect(() => {
    const filtered = removeDuplicate(productPicList)
    setFilterImages(filtered)
    if (filtered.length > 0) {
      setImages(filtered[0]?.images || [])
      setSelectedValue(filtered[0]?.id || '')
    }
  }, [productPicList, removeDuplicate])

  return (
    <div className='container'>
      <div className='left-panel'>
        {/* 顶部大图 - 使用Ant Design Carousel */}
        <Carousel
          ref={carouselRef}
          dots={false}
          autoplay={false}
          className='main-carousel'
          afterChange={handleCarouselChange}
          style={{ height: '580px', width: '480px', marginRight: '12px' }}
        >
          {images.map((item, index) => (
            <div key={index} className='carousel-item'>
              <Image
                src={item.url}
                className='carousel-image'
                preview={false}
                style={{
                  width: '100%',
                  height: '580px',
                  objectFit: 'contain' as const
                }}
                placeholder={<div style={{ width: '100%', height: '580px', background: '#f5f5f5' }} />}
              />
            </div>
          ))}
        </Carousel>

        {/* 底部缩略图（带滚动定位） */}
        <div className='thumbnails-container'>
          {/* 上箭头按钮 */}
          <Button
            type='default'
            className='scroll-btn'
            onClick={() => scroll(-1)}
            disabled={isAtLeft}
            icon={<UpOutlined />}
          />

          {/* 缩略图滚动容器 - 使用Ant Design Scrollbar */}
          <div
            className='thumbnails-wrapper'
            ref={thumbnailsWrapperRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '8px 0'
            }}
          >
            {images.map((item, index) => (
              <div
                key={index}
                className={`thumbnail-item ${activeIndex === index ? 'active' : ''}`}
                onClick={() => scrollToThumbnail(index)}
                style={{
                  position: 'relative',
                  width: '100px',
                  height: '80px',
                  cursor: 'pointer',
                  borderStyle: 'solid',
                  borderWidth: '2px',
                  borderColor: 'transparent', // 使用独立的 borderColor
                  transition: 'all 0.3s',
                  flexShrink: 0,
                  ...(activeIndex === index ? { borderColor: '#1677ff' } : {})
                }}
              >
                <Image
                  src={item.url}
                  className='thumbnail-img'
                  style={{
                    width: '100px',
                    height: '80px',
                    objectFit: 'cover' as const
                  }}
                  preview={false}
                  placeholder={<div style={{ width: '100%', height: '100%', background: '#f5f5f5' }} />}
                />
                <span
                  className='thumbnail-sort'
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '2px',
                    textAlign: 'center',
                    color: '#fff',
                    fontSize: '14px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)'
                  }}
                >
                  {index + 1}
                </span>
              </div>
            ))}
          </div>

          {/* 下箭头按钮 */}
          <Button
            type='default'
            className='scroll-btn'
            onClick={() => scroll(1)}
            disabled={isAtRight}
            icon={<DownOutlined />}
          />
        </div>
      </div>

      {/* 颜色选择器 */}
      {filterImages.length > 0 && (
        <Flex wrap='wrap' gap='small' justify='center' align='center' style={{ marginTop: '20px' }}>
          {filterImages.map(item => (
            <div
              key={item.id}
              className={`ys-anchor-item ${selectedValue === item.id ? 'ys-anchor-item-active' : ''}`}
              onClick={() => handleColorChange(item.id)}
              style={{
                padding: '4px 15px',
                borderRadius: '20px',
                marginBottom: '15px',
                color: '#2d2d2d',
                border: '2px solid #ccc',
                cursor: 'pointer',
                ...(selectedValue === item.id
                  ? {
                      borderColor: '#1677ff',
                      color: '#1677ff'
                    }
                  : {})
              }}
            >
              {item.color}
            </div>
          ))}
        </Flex>
      )}
    </div>
  )
})
ProductImageViewer.displayName = 'ProductImageViewer'
export default ProductImageViewer

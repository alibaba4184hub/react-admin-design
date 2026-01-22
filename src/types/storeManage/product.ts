import type { Dayjs } from 'dayjs'

export interface TableDataType {
  id: string
  images: { url: string }[]
  categoryName: string
  variant: { color: string; size: string }[]
  releaseStoreList: { storeTitle: string }[]
  createByName: string
  createTime: string
}

export interface SearchParams {
  page: number // 当前页
  size: number // 每页条数
  keyId: string // 成品编码
  productName?: string // 商品名称
  createByName?: string // 设计账号
  createTime?: string // 创建时间
  dateTimeRange: Dayjs[] // 创建时间
  releaseStatus?: string // 汇出状态
  categoryId?: string[] // 商品分类
}

export interface PageState {
  page: number
  size: number
}

export interface TableDataType {
  //  店铺名称
  storeTitle: string
  //   * 店铺类型
  storeType: string
  //   * 自定义编号
  storeCode: string
  //   * 店铺ID
  sellerId: string
  //   * 授权状态
  authStatus: number
  //   * 店铺状态
  status: number
  //   * 标签
  storeLogoFileName: string
  // 创建时间
  createTime: string
  // 更新时间
  updateTime: string
}

export interface SearchParams {
  keyword: string
  status: string
  createTime: string
  storeType: string
  authStatus: string
  dateRangeStr: string
}
export interface ShopFormState {
  storeTitle: string
  syncOrder: number
  storeType: number
  storeCode: string
  sdsStoreCode: string
  syncOrderStatusList: number[]
  syncOrderStatusUpdate: number | null
  deliveryType: number | null
  status: number
  autoDeliveryHour: number
  salePlatformId: number // 平台类型
}

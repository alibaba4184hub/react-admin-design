export interface StoreFilterResult {
  records: StoreFilterState[]
  pages: number
  current: number
  total: number
  size: number
}

export interface StoreFilterState {
  id: number
  storeTitle?: string
  storeType?: number
  storeCode?: string
  sellerId?: string
  authStatus?: number
  status?: number
  storeLogoFileName?: string
  createTime?: string
  updateTime?: string
}
export interface ShopFormState {
  salePlatformId?: number | null;
  storeTitle?: string;
  storeType?: number | null;
  storeCode?: string;
  sdsStoreCode?: string;
  sellerId?: string;
  accessTokenCn?: string;
  accessTokenGlobal?: string;
  accessTokenUs?: string;
  accessTokenEu?: string;
  syncOrder?: number | null;
  syncOrderDay?: number | null;
  deliveryType?: number | null;
  autoDeliveryHour?: number | null;
  syncOrderStatusList?: number[] | null;
  syncOrderStatusUpdate?: number | null;
  status?:number | null;
}

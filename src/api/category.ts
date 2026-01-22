import { service } from '@/utils/axios'

export const getAllCategoryList = (shopId?: number) => {
  return service({
    url: 'product/category/getAllCategory',
    method: 'get',
    params: {
      shopId
    }
  })
}

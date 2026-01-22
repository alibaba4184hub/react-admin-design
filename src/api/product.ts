import { service } from '@/utils/axios'

// 获取成品列表
export const getProductReleaseList = (params: any) => {
  return service({
    url: 'productRelease/productFinished/page',
    method: 'get',
    params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
  })
}

// 获取成品详情
export const getProductReleaseDetail = (params: object) => {
  return service({
    url: 'productRelease/productFinished/detail',
    method: 'get',
    params
  })
}

// 删除成品
export const delProductRelease = (data: object) => {
  return service({
    url: '/productRelease/productFinished/deleteBatch',
    method: 'delete',
    data,
    headers: { contentType: 'application/x-www-form-urlencoded' }
  })
}

/**
 * 更新产品信息的函数
 * @param {object} data - 包含更新产品所需的数据对象
 * @returns {Promise} 返回一个Promise对象，包含服务器响应的数据
 */
export const updateProduct = (data: object) => {
  // 导出更新产品的函数，接收一个对象类型的数据参数
  return service({
    url: '/productRelease/productFinished/update',
    method: 'post',
    data
  })
}

/**
 * 下载产品图片的函数
 * @param {object} params - 下载产品图片所需的参数对象
 * @returns {Promise} 返回一个Promise对象，包含请求的结果
 */
export const downloadProductImages = (params: object) => {
  return service({
    url: '/productRelease/productFinished/downloadProductFinishedImages',
    method: 'get',
    params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    responseType: 'blob' // 设置响应类型为blob，用于处理二进制数据
  })
}

// 成品发布
export const createProductRelease = (data: object) => {
  return service({
    url: 'productRelease/productrelease/create',
    method: 'post',
    data
  })
}

// 获取尺码表数据
export const getSizeChartsList = (params: any) => {
  return service({
    url: 'productRelease/temuapi/getSizecharts',
    method: 'get',
    params
  })
}

// 获取模特信息
export const getModelsList = (params: any) => {
  return service({
    url: 'productRelease/temuapi/getModelinfo',
    method: 'get',
    params
  })
}

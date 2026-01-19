import { service } from '@/utils/axios'
import type { StoreFilterResult } from '@/types/storeManage/store'

// 获取店铺列表-分页
export const getStoreList = (params: object) => {
  return service<StoreFilterResult>({
    url: 'productRelease/store/page',
    method: 'get',
    params
  })
}

// 获取店铺列表-非分页
export const getStores = (params: object) => {
  return service<{ id: number; storeTitle: string }[]>({
    url: 'productRelease/store/list',
    method: 'get',
    params
  })
}

// 店铺列表页面删除接口
export const delStore = (data: object) => {
  return service({
    url: '/productRelease/store/del',
    method: 'post',
    data
  })
}
// 编辑店铺信息
export const updateStoreFiled = (data: object) => {
  return service({
    url: '/productRelease/store/update',
    method: 'post',
    data
  })
}
// 添加店铺绑定
export const createStoreFiled = (data: object) => {
  return service({
    url: 'productRelease/store/create',
    method: 'post',
    data
  })
}
// 获取店铺详情
export const getStoreDetail = (params: object) => {
  return service({
    url: 'productRelease/store/detail',
    method: 'get',
    params
  })
}
// 更新店铺开业状态
export const updateStoreStatus = (data: object) => {
  return service({
    url: '/productRelease/store/updateField',
    method: 'post',
    data
  })
}

// 上传标签信息
export const updateLabel = (data: object) => {
  return service({
    url: '/productRelease/store/uploadImg',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data; boundary=something' }
  })
}
// 下载标签信息
export const downloadLabel = (params: object) => {
  return service({
    url: '/productRelease/store/download',
    method: 'get',
    params,
    responseType: 'blob', // 表明服务器响应的数据类型
    headers: { 'Content-Type': 'application/octet-stream;charset=utf-8' }
  })
}

// 店铺列表页面的删除标签信息接口
export const delStoreLabel = (data: object) => {
  return service({
    url: '/productRelease/store/delLogo',
    method: 'post',
    data
  })
}

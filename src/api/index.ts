import { service } from '@/utils/axios'

interface LoginParams {
  username: string
  password: string
}

// User login api
export function loginApi(data: LoginParams, csrfToken: string): Promise<any> {
  return service({
    url: '/login/signin',
    method: 'post',
    data,
    headers: {
      'X-CSRF-Token': csrfToken
    }
  })
}
// 获取MD5加密token
export const getCsrf = () => {
  return service<any>({
    url: 'common/csrf/create',
    method: 'get'
  })
}
// Get User info
export function getUserInfo(): Promise<any> {
  return service({
    url: '/getUserInfo',
    method: 'get'
  })
}
export const getShopMyShop = (params: object) => {
  return service({
    url: 'merchant/shop/myShop',
    method: 'get',
    params,
    noErrorTip: true
  })
}
// User logout api
export function logoutApi() {
  return service({
    url: 'login/logout',
    method: 'post'
  })
}

// Table list
export function getTableList(params: any) {
  return service({
    url: '/table/getTableList',
    method: 'get',
    params
  })
}

export const getMineInfo = () => {
  return service({
    url: 'authority/adminUser/mineDetail',
    method: 'get'
  })
}

export const getAdminBase = () => {
  return service({
    url: 'setting/config/getAdminBase',
    method: 'get'
  })
}

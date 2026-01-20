import { service } from '@/utils/axios'

// shein 店铺授权--应用授权 获取重定向地址
export const getSheinRedirectUrl = (params: object) => {
  return service({
    url: '/productRelease/sheinapi/getAuthorizeRedirectUrl',
    method: 'get',
    params
  })
}
// shein 店铺授权--应用授权, 设置openKeyId 和 secretKey
export const setSheinAuthKey = (data: object) => {
  return service({
    url: '/productRelease/sheinapi/auth',
    method: 'post',
    data
  })
}

import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import axios from 'axios'
import { message } from 'antd'
import { getToken, clearAuthCache } from '@/utils/auth'
import { formatArguments } from '@/utils/index'
const { VITE_BASE_URL, VITE_REQUEST_URL_PREFIX } = import.meta.env

// 接口加密密钥--请自行修改
const prefix = VITE_REQUEST_URL_PREFIX
const baseURL = `${VITE_BASE_URL}${prefix}`
// Create axios instance
const service = axios.create({
  baseURL: baseURL,
  timeout: 10 * 1000,
  headers: () => {
    return {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken(),
      'X-Shop-Id': localStorage.getItem('shopId') || 0,
      'X-Vendor-Id': localStorage.getItem('vendorId') || 0,
      'X-ADMIN-TYPE': localStorage.getItem('adminType') || 'admin',
      'X-ClIENT-TYPE': 'admin'
    }
  }
})

// Handle Error
const handleError = (error: AxiosError): Promise<AxiosError> => {
  if (error.response?.status === 401 || error.response?.status === 504) {
    clearAuthCache()
    location.href = '/login'
  }
  message.error(error.message || 'error')
  return Promise.reject(error)
}

// Request interceptors configuration
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    ;(config as Recordable).headers['Authorization'] = `Bearer ${token}`
  }

  config.params = formatArguments(config.params)
  if (!config.headers['Content-Type']) {
    ;(config as Recordable).headers['Content-Type'] = 'application/json'
  }
  return config
}, handleError)

// Respose interceptors configuration
service.interceptors.response.use((response: AxiosResponse) => {
  const data = response.data

  if (data.code === 0) {
    return data.data
  } else {
    message.error(data.message)

    return Promise.reject('error')
  }
}, handleError)

export { service }

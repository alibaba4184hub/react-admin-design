import type { UserState } from '@/stores/types'
import { createSlice } from '@reduxjs/toolkit'
import { TOKEN_KEY, USER_INFO_KEY, ADMIN_TYPE } from '@/enums/cacheEnum'
import { setAuthCache, setAdminTypeCache } from '@/utils/auth'
import { getMineInfo, getAdminBase } from '@/api'

const initialState: UserState = {
  userInfo: null,
  shopInfo: null,
  vendorInfo: null,
  token: undefined,
  sessionTimeout: false,
  lastUpdateTime: 0,
  adminType: undefined,
  config: {
    pageSize: 15,
    icoDefinedCss: '//at.alicdn.com/t/c/font_400590_7he137t8862',
    dollarSign: '¥',
    amountUnit: '元',
    storageType: 0,
    storageUrl: '',
    pcDomain: '',
    h5Domain: '',
    imDomain: '',
    version: '',
    versionType: '',
    uploadMaxSize: 100,
    shopCompany: 1,
    shopCompanyTxt: '',
    defaultTechSupport: '',
    defaultCopyright: 'Copyright © 2024 Tigshop. All Rights Reserved',
    poweredBy: 0,
    poweredByLogo: '',
    poweredByStatus: 0,
    adminLightLogo: null, //  后台LOGO
    versionInfoHidden: 0, //  是否隐藏版本号
    layout: 'default', //  导航模式
    navTheme: 'dark', //   外观
    primaryColor: 'blue', //  主题色
    withdrawSettingVO: {}
  }
}

const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload ? action.payload : ''
      setAuthCache(TOKEN_KEY, action.payload)
    },
    setAdminType: (state, action) => {
      state.adminType = action.payload ? action.payload : ''
      setAdminTypeCache(ADMIN_TYPE, action.payload)
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload
      state.lastUpdateTime = new Date().getTime()
      setAuthCache(USER_INFO_KEY, action.payload)
    },
    setShopInfo: (state, action) => {
      state.shopInfo = action.payload
    },
    setVendorInfo: (state, action) => {
      state.vendorInfo = action.payload
    },
    setSessionTimeout: (state, action) => {
      state.sessionTimeout = action.payload
    },
    resetState(state) {
      state.userInfo = null
      state.token = undefined
      state.sessionTimeout = false
      state.lastUpdateTime = 0
    },
    setConfig: (state, action) => {
      state.config = action.payload
    }
  }
})
// 解构createAction
const { setToken, setUserInfo, setAdminType, setSessionTimeout, resetState, setConfig, setShopInfo, setVendorInfo } =
  user.actions
const updateUserInfo = () => {
  return async dispatch => {
    try {
      const result = await getMineInfo()
      dispatch(setUserInfo(result))
      localStorage.setItem('user', JSON.stringify({ userInfo: result }))

      if (localStorage.getItem('adminType') == 'shop') {
        const result2 = await getShopInfo()
        dispatch(setShopInfo(result2))
        localStorage.setItem('shopInfo', JSON.stringify(result))
      }
      if (localStorage.getItem('adminType') == 'vendor') {
        const result3 = await vendorSetting()
        dispatch(setVendorInfo(result3))
        localStorage.setItem('vendorInfo', JSON.stringify(result))
      }
    } catch (error) {
      console.error('fetch api is error:', error)
    } finally {
    }
  }
}

const updateConfig = () => {
  return async dispatch => {
    try {
      const result = await getAdminBase()
      dispatch(setConfig(Object.assign({}, initialState.config, result)))
      localStorage.setItem('config', JSON.stringify(result))
    } catch (error) {
      console.error('fetch api is error:', error)
    } finally {
    }
  }
}

export { setToken, setUserInfo, setAdminType, setSessionTimeout, resetState, updateUserInfo, updateConfig }

export default user.reducer

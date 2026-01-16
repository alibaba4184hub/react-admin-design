import type { LoginParams, UserInfo } from '@/types'
import { type FC, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Form, Input, Checkbox, Button, message, notification } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAppSelector, useAppDispatch } from '@/stores'
import {
  setToken,
  setUserInfo,
  setSessionTimeout,
  setAdminType,
  updateUserInfo,
  updateConfig
} from '@/stores/modules/user'
import { clearMenus, setMenuList } from '@/stores/modules/menu'
import { getAuthCache } from '@/utils/auth'
import { TOKEN_KEY } from '@/enums/cacheEnum'
import SubLoginPanel from './components/SubLoginPanel.tsx'
import { loginApi, getShopMyShop, getCsrf } from '@/api'
import logoIcon from '@/assets/images/logo_name.png'
import classNames from 'classnames'
import styles from './index.module.less'

const LoginPage: FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string>('')
  const [showPanel, setShowPanel] = useState<boolean>(false)
  const [shopList, setShopList] = useState<any[]>([])
  const [vendorList, setVendorList] = useState<any[]>([])
  const { userInfo } = useAppSelector(state => state.user)
  const dispatch = useAppDispatch()

  const { token, sessionTimeout } = useAppSelector(state => state.user)
  const getToken = (): string => {
    return token || getAuthCache<string>(TOKEN_KEY)
  }

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const _getCsrf = async () => {
    try {
      const result = await getCsrf()
      setCsrfToken(result.data)
    } catch (error) {
    } finally {
    }
  }
  const handleLogin = async (values: any) => {
    try {
      setLoading(true)
      await _getCsrf()
      const userInfo = await loginAction(
        {
          username: values.username,
          password: values.password,
          loginType: 'password',
          captchaUid: ''
        },
        csrfToken
      )
    } catch (error) {
      message.error((error as unknown as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const loginAction = async (
    params: LoginParams & {
      goHome?: boolean
    },
    csrfToken: string
  ): Promise<UserInfo | null> => {
    try {
      const { goHome = true, ...loginParams } = params
      const data = await loginApi(loginParams, csrfToken)

      // 保存 Token
      dispatch(setToken(data?.token))
      dispatch(setAdminType(data?.adminType))
      setShowPanel(true)
      return afterLoginAction()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const afterLoginAction = async (): Promise<UserInfo | null> => {
    if (!getToken()) return null

    const userInfo = await getShopInfoAction()

    if (sessionTimeout) {
      dispatch(setSessionTimeout(false))
    }

    return userInfo
  }
  const handleNavToPage = async (e: any) => {
    localStorage.setItem('adminType', e.type)
    localStorage.removeItem('shopId')
    localStorage.removeItem('vendorId')
    if (e.type == 'shop') {
      localStorage.setItem('shopId', String(e.id))
    }
    if (e.type == 'vendor') {
      localStorage.setItem('vendorId', String(e.id))
    }
    // 更新后台设置项
    dispatch(await updateUserInfo())
    dispatch(await updateConfig())

    notification.success({
      message: '登录成功',
      placement: 'top',
      duration: 1.5,
      description: '您好，欢迎回来'
    })
    // 切换到商铺选择页面
    // clearMenus()
    // const routers = await getMenu()
    // setMenuList(routers || [])
    // if (props.isIndex) {
    //   emit('closePopup')
    //   const path = `${router.options.history.base}${routers ? routers[0].path : '/'}`
    //   window.history.pushState({ path }, '', path)
    //   setTimeout(() => {
    //     location.reload()
    //   }, 150)
    //   return
    // }
    // localStorage.setItem('lastOpenTime', String(dayjs().unix()))
    // navigate(routers ? firstRouter(routers[0]) : '/')
    const redirect = searchParams.get('redirect')
    if (redirect) {
      navigate(redirect)
    } else {
      navigate(userInfo?.homePath || '/home')
    }
  }

  const getShopInfoAction = async (): Promise<UserInfo | null> => {
    if (!getToken()) return null
    setLoading(true)
    const result = await getShopMyShop()
    if (result.shop.records) {
      setShopList(result.shop.records)
    }
    if (result.vendor.records) {
      setVendorList(result.vendor.records)
    }
    if (result.userinfo) {
      dispatch(setUserInfo(result.userinfo))
    }
    setLoading(false)

    return result.userinfo
  }
  const handlePanelVisible = (visible: boolean) => {
    setShowPanel(visible)
  }

  return (
    <div className={styles['login-wrapper']}>
      {showPanel ? (
        <SubLoginPanel
          navToPage={handleNavToPage}
          selectShopFlag={handlePanelVisible}
          myShopList={shopList}
          vendorList={vendorList}
          loading={loading}
          userInfo={userInfo}
        />
      ) : (
        <div className={styles['login-box']}>
          <div className={styles['login-box-title']}>
            <img src={logoIcon} alt='icon' />
            <p>账 号 登 录</p>
          </div>
          <Form
            form={form}
            initialValues={{
              username: 'admin',
              password: 'admin123',
              remember: true
            }}
            className={styles['login-box-form']}
            onFinish={handleLogin}
          >
            <Form.Item name='username' rules={[{ required: true, message: '请输入账号' }]}>
              <Input
                placeholder='请输入账号'
                prefix={<UserOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} rev={undefined} />}
              />
            </Form.Item>
            <Form.Item name='password' rules={[{ required: true, message: '请输入密码' }]}>
              <Input
                type='password'
                placeholder='请输入密码'
                prefix={<LockOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} rev={undefined} />}
              />
            </Form.Item>
            <Form.Item>
              <Form.Item name='remember' className={classNames('fl', styles['no-margin'])} valuePropName='checked'>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Form.Item className={classNames('fr', styles['no-margin'])}>
                <a href=''>忘记密码？</a>
              </Form.Item>
            </Form.Item>
            <Form.Item>
              <Button type='primary' htmlType='submit' className={styles['login-btn']} loading={loading}>
                登 录
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  )
}

export default LoginPage

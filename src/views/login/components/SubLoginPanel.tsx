import type { FC } from 'react'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import styles from './SubLoginPanel.module.less'
import { Spin, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import shopLogoBlue from '@/assets/logo/shop_logo_b.png'
import shopLogo from '@/assets/logo/shop_logo.png'
import supplierLogo from '@/assets/logo/supplier-logo.png'
import { useAppSelector } from '@/stores'
import { getAuthCache, clearAuthCache } from '@/utils/auth'
import { logoutApi } from '@/api'
import { resetState } from '@/stores/modules/user'
import { useMessage } from '@/hooks/web/useMessage'
import { useAppDispatch } from '@/stores'
import { TOKEN_KEY } from '@/enums/cacheEnum'
import classNames from 'classnames'
interface PropState {
  loading: boolean
  userInfo: any
  myShopList: any
  vendorList: any
  navToPage: (params: { id: number; type: string }) => void
  selectShopFlag: (flag: boolean) => void
}

const SubLoginPanel: FC<PropState> = props => {
  // 结构传值
  const { loading, userInfo, myShopList, vendorList, navToPage, selectShopFlag } = props
  const { adminType } = useAppSelector(state => state.user)
  const isPhoneNumber = (username: string): boolean => {
    // 使用正则表达式判断是否为手机号
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(username)
  }
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { createMessage } = useMessage()
  const encryptPhoneNumber = (username: string): string => {
    if (isPhoneNumber(username)) {
      // 加密中间4位
      return username.slice(0, 3) + '****' + username.slice(7)
    }
    return username
  }
  const toIndex = async (id: number, type: string) => {
    navToPage({ id, type })
  }
  const { token } = useAppSelector(state => state.user)
  const getToken = (): string => {
    return token || getAuthCache<string>(TOKEN_KEY)
  }
  // 注销
  const logoutAction = async (goLogin = false) => {
    if (getToken()) {
      try {
        await logoutApi()
      } catch (error) {
        console.error('注销失败:', error)
        createMessage.error('注销失败!')
      }
    }
    dispatch(resetState())
    clearAuthCache()
    goLogin ? navigate('/login') : null
  }
  //   返回
  const backAction = () => {
    selectShopFlag(false)
    logoutAction(true)
  }
  return (
    <div className={styles['sub-login-panel']}>
      <div className={styles['sub-login-back']} onClick={() => backAction()}>
        <LeftOutlined className={styles['sub-login-back__icon']} />
        返回
      </div>
      <div className={styles['sub-login-panel__title']}>您可以进入以下管理后台</div>
      {userInfo?.username && (
        <div className={styles['sub-login-panel__desc']}>
          <span>{encryptPhoneNumber(userInfo?.username)}</span>
          已绑定了以下店铺，您可以进入以下任一店铺
        </div>
      )}

      <Spin spinning={loading} style={{ width: '100%', marginTop: '100px', height: '100%' }} />
      {!loading && adminType === 'admin' && (
        <div className={styles['sub-login-panel__list']}>
          <div
            onClick={() => toIndex(0, 'admin')}
            className={styles['shop-item']}
            style={{ borderColor: '#ffeac7', backgroundColor: '#fff4e6', color: '#4e4e4e' }}
          >
            <div className={styles['left-item']}>
              <img className={styles['left-image']} src={shopLogoBlue} alt='' />
              <div className={styles['left-info']}>
                <div className={styles['left-title']}>
                  管理后台
                  {userInfo?.username && <span>（{encryptPhoneNumber(userInfo?.username)}）</span>}
                </div>
              </div>
            </div>
            <div className={styles['right-item']}>
              <RightOutlined className={styles['iconfont-admin']} />
            </div>
          </div>
        </div>
      )}
      {/* 店铺列表 */}
      {myShopList.length > 0 && (
        <div
          className={classNames(styles['sub-login-panel__list'], {
            [styles['shop-list-min-height']]: vendorList.length === 0
          })}
        >
          {!loading &&
            myShopList.map(item => (
              <div key={item.shopId} className={styles['shop-item']} onClick={() => toIndex(item.shopId, 'shop')}>
                <div className={styles['left-item']}>
                  <img className={styles['left-image']} src={shopLogo} alt={item.shopTitle} />
                  <div className={styles['left-title']}>
                    <div className={styles['left-title']}>{item.shopTitle}</div>
                  </div>
                </div>
                <div className={styles['right-item']}>
                  <RightOutlined className={styles['iconfont-admin']} />
                </div>
              </div>
            ))}
        </div>
      )}
      {/* 供应商列表 */}
      {vendorList.length > 0 && (
        <div
          className={classNames(styles['sub-login-panel__list'], styles['shop-list-min-height'], {
            [styles.top]: myShopList.length > 0
          })}
        >
          {!loading &&
            vendorList.map(item => (
              <div key={item.vendorId} className={styles['shop-item']} onClick={() => toIndex(item.vendorId, 'vendor')}>
                <div className={styles['left-item']}>
                  <img className={styles['left-image']} src={supplierLogo} alt={item.vendorName} />
                  <div className={styles['left-info']}>
                    <div className={styles['left-title']}>{item.vendorName}</div>
                  </div>
                </div>
                <div className={styles['right-item']}>
                  <RightOutlined className={styles['iconfont-admin']} />
                </div>
              </div>
            ))}
        </div>
      )}
      {/* 空状态 */}
      {!loading && myShopList.length === 0 && vendorList.length === 0 && adminType !== 'admin' && (
        <div className={`${styles['sub-login-panel__list']} ${styles['shop-list-min-height']}`}>
          <Empty description='您还没有已绑定的店铺哦～' />
        </div>
      )}
    </div>
  )
}
export default SubLoginPanel

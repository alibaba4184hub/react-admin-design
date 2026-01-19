import { lazy } from '@loadable/component'
import type { RouteObject } from '../types'
import { LayoutGuard } from '../guard'
import { LazyLoad } from '@/components/LazyLoad'

// component module page
const CompoRoute: RouteObject = {
  path: '/store',
  name: 'StoreManage',
  element: <LayoutGuard />,
  meta: {
    title: '店铺绑定',
    icon: 'compo',
    orderNo: 7
  },
  children: [
    {
      path: 'temu',
      name: 'Temu',
      element: LazyLoad(lazy(() => import('@/views/storeManage/temu/Temu'))),
      meta: {
        title: 'TEMU',
        key: 'temuBind'
      }
    }
  ]
}

export default CompoRoute

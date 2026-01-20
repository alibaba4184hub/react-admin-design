// AddStore.tsx - 修复版本
import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { Form, Input, Select, Button, message, Row, Col, Radio, InputNumber } from 'antd'
import { ShopFormState } from '@/types/storeManage/store'
import { getStoreDetail, createStoreFiled, updateStoreFiled } from '@/api/temu'
import { shopTypeDict, orderSyncDict, orderMarkDict, shopStatusDict } from '@/constant/storeManage/dict'

// 定义 ref 的类型store
export interface AddStoreRef {
  onFormSubmit: () => Promise<void>
}

// 定义 props 类型
export interface AddStoreProps {
  act?: string
  id?: string | number
  [key: string]: any
  submitCallback?: (result: any, isClose?: boolean) => void
  setConfirmLoading?: (loading: boolean) => void
  confirmLoading?: boolean
  okType?: (enabled: boolean) => void
  visible?: boolean
  isDialog?: boolean
}

// 使用 forwardRef
const AddStore = forwardRef<AddStoreRef, AddStoreProps>((props, ref) => {
  const { submitCallback, setConfirmLoading, okType } = props
  console.log('AddStore params:', props)

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [formState, setFormState] = useState<ShopFormState>({
    storeTitle: '',
    storeType: undefined,
    status: undefined,
    storeCode: '',
    sellerId: '',
    accessTokenCn: '',
    accessTokenUs: '',
    accessTokenGlobal: '',
    accessTokenEu: '',
    syncOrder: undefined,
    syncOrderDay: undefined,
    deliveryType: undefined,
    autoDeliveryHour: undefined
  })
  // 初始化 - 启用确定按钮
  useEffect(() => {
    okType?.(true)
  }, [okType])

  // 暴露方法给 DialogForm
  useImperativeHandle(ref, () => ({
    onFormSubmit: async () => {
      console.log('AddStore.onFormSubmit 被调用')
      handleSubmit()
    }
  }))

  const fetchShopInfo = async () => {
    try {
      const result = await getStoreDetail({ id: props.id })
      setFormState(result)
      form.setFieldsValue(result)
    } catch (error: any) {
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 获取详情数据
    if (props.act === 'update') {
      fetchShopInfo()
    }
  }, [props.id])

  const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 }
  }
  // 表单提交处理
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      // 设置加载状态
      setConfirmLoading?.(true)
      setLoading(true)

      // API 调用
      const result =
        props.act === 'update'
          ? await updateStoreFiled({ id: props.id, ...values, salePlatformId: 23 })
          : await createStoreFiled({ ...values, salePlatformId: 23 })

      // 提交成功
      message.success('操作成功')

      console.log('提交成功，结果:', result)

      // 调用回调
      if (submitCallback) {
        submitCallback(result, true)
      } else {
        console.warn('submitCallback 未定义')
      }

      return result
    } catch (error: any) {
      console.error('表单提交失败:', error)

      if (error.errorFields && error.errorFields.length > 0) {
        // 表单验证错误
        message.error('请正确填写表单')
      }

      const errorResult = {
        success: false,
        code: 1,
        message: error.message || '提交失败',
        error
      }

      submitCallback?.(errorResult, false)
      throw error
    } finally {
      console.log('清理加载状态...')
      setConfirmLoading?.(false)
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <Form form={form} {...formItemLayout} layout='horizontal' disabled={loading} initialValues={formState}>
        {/* 店铺名称 */}
        <Form.Item label='店铺名称' name='storeTitle' rules={[{ required: true, message: '店铺名称不能为空!' }]}>
          <Input
            placeholder='请输入店铺名称'
            className='tig-input'
            value={formState.storeTitle}
            onChange={e => setFormState({ ...formState, storeTitle: e.target.value })}
          />
        </Form.Item>

        {/* 店铺类型 */}
        <Form.Item label='店铺类型' name='storeType' rules={[{ required: true, message: '店铺类型不能为空!' }]}>
          <Radio.Group
            value={formState.storeType}
            onChange={e => setFormState({ ...formState, storeType: e.target.value })}
          >
            {shopTypeDict.map(item => (
              <Radio key={item.value} value={item.value}>
                {item.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        {/* 店铺状态 */}
        <Form.Item label='店铺状态'>
          <Radio.Group value={formState.status} onChange={e => setFormState({ ...formState, status: e.target.value })}>
            {shopStatusDict.map(item => (
              <Radio key={item.value} value={item.value}>
                {item.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        {/* 自定义编号 */}
        <Form.Item label='自定义编号' name='storeCode' rules={[{ required: true, message: '自定义编号不能为空!' }]}>
          <Input
            placeholder='请输入自定义编号'
            className='tig-input'
            value={formState.storeCode}
            onChange={e => setFormState({ ...formState, storeCode: e.target.value })}
          />
        </Form.Item>

        {/* Seller_ID */}
        <Form.Item label='Seller_ID' name='sellerId' rules={[{ required: true, message: 'seller_id不能为空!' }]}>
          <Input
            placeholder='请输入seller_id'
            className='tig-input'
            value={formState.sellerId}
            onChange={e => setFormState({ ...formState, sellerId: e.target.value })}
          />
        </Form.Item>

        {/* AccessToken */}
        <Form.Item
          label='AccessToken'
          name='accessTokenCn'
          rules={[{ required: true, message: 'AccessToken不能为空!' }]}
        >
          <Input
            placeholder='请输入AccessToken'
            className='tig-input'
            value={formState.accessTokenCn}
            onChange={e => setFormState({ ...formState, accessTokenCn: e.target.value })}
          />
        </Form.Item>

        {/* 条件渲染：当 storeType 为 0 时 */}
        {formState.storeType === 0 && (
          <>
            <Form.Item label='订单美区(us)Token' name='accessTokenUs'>
              <Input
                placeholder='请输入订单美区(us)token'
                className='tig-input'
                value={formState.accessTokenUs}
                onChange={e => setFormState({ ...formState, accessTokenUs: e.target.value })}
              />
            </Form.Item>

            <Form.Item label='订单全球(glb)Token' name='accessTokenGlobal'>
              <Input
                placeholder='请输入订单全球(glb)token'
                className='tig-input'
                value={formState.accessTokenGlobal}
                onChange={e => setFormState({ ...formState, accessTokenGlobal: e.target.value })}
              />
            </Form.Item>

            <Form.Item label='订单欧区(eu)Token' name='accessTokenEu'>
              <Input
                placeholder='请输入订单欧区(eu)token'
                className='tig-input'
                value={formState.accessTokenEu}
                onChange={e => setFormState({ ...formState, accessTokenEu: e.target.value })}
              />
            </Form.Item>
          </>
        )}

        {/* 订单同步 */}
        <Form.Item label='订单同步' name='syncOrder'>
          <Radio.Group
            value={formState.syncOrder}
            onChange={e => setFormState({ ...formState, syncOrder: e.target.value })}
          >
            {orderSyncDict.map(item => (
              <Radio key={item.value} value={item.value}>
                {item.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        {/* 订单同步时间 */}
        {formState.syncOrder === 1 && (
          <Form.Item
            label='订单同步时间'
            name='syncOrderDay'
            rules={[{ required: true, message: '订单同步时间不能为空!' }]}
          >
            <Row gutter={20} align='middle'>
              <Col span={3}>
                <div style={{ color: 'rgba(0, 0, 0, 0.85)' }}>同步近</div>
              </Col>
              <Col span={6}>
                <InputNumber
                  placeholder='请输入订单同步时间'
                  min={1}
                  max={100}
                  value={formState.syncOrderDay ?? undefined} // 使用空值合并运算符
                  onChange={value => setFormState({ ...formState, syncOrderDay: Number(value) || undefined })}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={11}>
                <div style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                  天的订单 <span style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px' }}>(只同步待发货订单)</span>
                </div>
              </Col>
            </Row>
          </Form.Item>
        )}

        {/* 订单标记发货 */}
        <Form.Item
          label='订单标记发货'
          name='deliveryType'
          rules={[{ required: true, message: '订单标记发货不能为空!' }]}
        >
          <Select
            placeholder='请选择'
            allowClear
            value={formState.deliveryType}
            onChange={value => setFormState({ ...formState, deliveryType: value })}
          >
            {orderMarkDict.map(item => (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 自动发货时间 */}
        <Form.Item
          label='自动发货时间'
          name='autoDeliveryHour'
          rules={[{ required: true, message: '自动发货时间不能为空!' }]}
        >
          <Row gutter={24} align='middle'>
            <Col span={5}>
              <div style={{ color: 'rgba(0, 0, 0, 0.85)' }}>单号生成后</div>
            </Col>
            <Col span={12}>
              <InputNumber
                min={1}
                max={100}
                placeholder='请输入自动发货时间'
                value={formState.autoDeliveryHour ?? undefined} // 使用空值合并运算符
                onChange={value => setFormState({ ...formState, autoDeliveryHour: Number(value) || undefined })}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={7}>
              <div style={{ color: 'rgba(0, 0, 0, 0.85)' }}>小时自动发货</div>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </div>
  )
})

// 非常重要：设置 displayName
AddStore.displayName = 'AddStore'

export default AddStore

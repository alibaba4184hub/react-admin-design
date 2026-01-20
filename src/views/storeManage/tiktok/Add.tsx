import { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { Form, Input, Select, message, Row, Col, Radio, InputNumber } from 'antd'
import type { ShopFormState } from '@/types/storeManage/tiktok'
import { getStoreDetail, createStoreFiled, updateStoreFiled } from '@/api/temu'
import { storeTypeDict, orderSyncDict, orderMarkDict, shopStatusDict } from '@/constant/storeManage/dict'
import type { AddStoreProps, AddStoreRef } from '@/types/storeManage/store'
import styles from './Tiktok.module.less'
const AddStore = forwardRef<AddStoreRef, AddStoreProps>((props, ref) => {
  const { submitCallback, setConfirmLoading, okType } = props
  const [form] = Form.useForm()
  const [loading, setLoading] = useState<boolean>(false)
  const [formState, setFormState] = useState<ShopFormState>({
    storeTitle: '',
    syncOrder: 1,
    storeType: 0,
    storeCode: '',
    sdsStoreCode: '',
    syncOrderStatusList: [],
    deliveryType: null,
    status: 1,
    syncOrderDay: NaN,
    autoDeliveryHour: 48,
    salePlatformId: 30 // 平台类型
  })

  // 暴露方法给 DialogForm
  useImperativeHandle(ref, () => ({
    onFormSubmit: async () => {
      console.log('AddStore.onFormSubmit 被调用')
      handleSubmit()
    }
  }))
  // 初始化 - 启用确定按钮
  useEffect(() => {
    okType?.(true)
  }, [okType])

  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 }
  }
  // 获取详情
  const fetchShopInfo = async () => {
    try {
      const result: any = await getStoreDetail({ id: props.id })
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
  // 提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      // 设置加载状态
      setConfirmLoading?.(true)
      setLoading(true)

      // API 调用
      const result =
        props.act === 'update'
          ? await updateStoreFiled({ id: props.id, ...values, salePlatformId: 30 })
          : await createStoreFiled({ ...values, salePlatformId: 30 })

      // 提交成功
      message.success('操作成功')

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
    <Form
      style={{ padding: '20px' }}
      form={form}
      {...formItemLayout}
      layout='horizontal'
      disabled={loading}
      initialValues={formState}
    >
      <Form.Item label='店铺名称' name='storeTitle' rules={[{ required: true, message: '店铺名称不能为空!' }]}>
        <Input
          placeholder='请输入店铺名称'
          value={formState.storeTitle}
          onChange={e => setFormState({ ...formState, storeTitle: e.target.value })}
        ></Input>
      </Form.Item>
      {/* 店铺类型 */}
      <Form.Item label='店铺类型' name='storeType'>
        <Radio.Group
          value={formState.storeType}
          onChange={e => setFormState({ ...formState, storeType: e.target.value })}
        >
          {storeTypeDict.map(item => (
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
          value={formState.storeCode}
          onChange={e => setFormState({ ...formState, storeCode: e.target.value })}
        />
      </Form.Item>

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
      {formState.syncOrder === 1 && (
        <Form.Item
          label='订单同步时间'
          name='syncOrderDay'
          rules={[{ required: true, message: '订单同步时间不能为空!' }]}
        >
          <Row gutter={24} align='middle'>
            <Col span={3}>
              <span className={styles['main-extra-title']}>同步近</span>
            </Col>
            <Col span={11} style={{ paddingLeft: 0, paddingRight: 0 }}>
              <InputNumber
                min={0}
                value={formState.syncOrderDay}
                onChange={value => setFormState({ ...formState, syncOrderDay: value as number })}
                placeholder='请输入订单同步时间'
                style={{ width: '100%' }}
                precision={0}
              />
            </Col>
            <Col span={10}>
              <div className={styles['main-extra-title']}>
                天的订单 <span className={styles['sub-title']}>(只同步待发货订单)</span>
              </div>
            </Col>
          </Row>
        </Form.Item>
      )}
      <Form.Item
        label='订单标记发货'
        name='deliveryType'
        rules={[{ required: true, message: '订单标记发货不能为空!' }]}
      >
        <Select
          value={formState.deliveryType}
          onChange={value => setFormState({ ...formState, deliveryType: value })}
          allowClear
          placeholder='请选择订单标记发货'
        >
          {orderMarkDict?.map(item => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {formState.deliveryType === 1 && (
        <Form.Item
          label='自动发货时间'
          name='autoDeliveryHour'
          rules={[{ required: true, message: '自动发货时间不能为空!' }]}
        >
          <Row gutter={24} align='middle'>
            <Col span={6}>
              <span>单号生成后</span>
            </Col>
            <Col span={8} style={{ paddingLeft: 0, paddingRight: 0 }}>
              <InputNumber
                min={0}
                value={formState.autoDeliveryHour}
                onChange={value => setFormState({ ...formState, autoDeliveryHour: value as number })}
                placeholder='请输入自动发货时间'
                style={{ width: '100%' }}
                precision={0}
              />
            </Col>
            <Col span={10}>
              <span>小时自动发货</span>
            </Col>
          </Row>
        </Form.Item>
      )}
    </Form>
  )
})

// 非常重要：设置 displayName
AddStore.displayName = 'AddStore'

export default AddStore

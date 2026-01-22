import { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { Form, Input, message } from 'antd'
import { updateProduct } from '@/api/product'
interface FormState {
  keyId?: string
  categoryName?: string
  productName?: string
  productEnglishName?: string
}

export interface AddProductProps {
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

export interface AddStoreRef {
  onFormSubmit: () => Promise<void>
}

const { TextArea } = Input
const EditProduct = forwardRef<AddStoreRef, AddProductProps>((props, ref) => {
  const [formState, setFormState] = useState<FormState>({})
  const { id, rowData, submitCallback, setConfirmLoading, okType } = props
  const [form] = Form.useForm()
  // 同步外部传入的 formState
  useEffect(() => {
    setFormState({
      keyId: rowData.keyId,
      categoryName: rowData.categoryName,
      productName: rowData.productName,
      productEnglishName: rowData.productEnglishName
    })
    form.setFieldsValue(rowData)
  }, [rowData])

  // 初始化 - 启用确定按钮
  useEffect(() => {
    okType?.(true)
  }, [okType])

  // 暴露方法给 DialogForm
  useImperativeHandle(ref, () => ({
    onFormSubmit: async () => {
      handleSubmit()
    }
  }))
  const validateEnglishName = (rule: any, value: string, callback: any) => {
    if (value) {
      const enRegex = /[\u4E00-\u9FA5]/ // 中文字符正则
      if (enRegex.test(value)) {
        return callback(new Error('名称中包含非英文字符'))
      } else {
        return callback()
      }
    } else {
      return callback(new Error('请输入商品英文名称'))
    }
  }
  // 表单验证规则
  const formRules = {
    productName: [
      { required: true, message: '请输入商品中文名称' },
      { max: 1000, message: '不能超过1000个字符' }
    ],
    productEnglishName: [
      { required: true, validator: validateEnglishName, trigger: 'blur' },
      { max: 1000, message: '不能超过1000个字符' }
    ]
  }
  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      // 设置加载状态
      setConfirmLoading?.(true)
      const params = {
        id,
        productName: values.productName,
        productEnglishName: values.productEnglishName
      }
      const result = await updateProduct(params)
      // 设置加载状态
      setConfirmLoading?.(false)
      // 提交成功
      message.success('修改成功')

      // 调用回调
      if (submitCallback) {
        submitCallback(result, true)
      } else {
        console.warn('submitCallback 未定义')
      }

      return result
    } catch (errorInfo) {
      console.error('Failed to submit: ', errorInfo)
    }
  }

  return (
    <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} className='w-full'>
      <Form.Item label='成品编码：'>
        <div className='ant-form-text'>{formState.keyId || '-'}</div>
      </Form.Item>

      <Form.Item label='商品分类：'>
        <div className='ant-form-text'>{formState.categoryName || '-'}</div>
      </Form.Item>

      <Form.Item label='商品中文名称：' name='productName' rules={formRules.productName}>
        <TextArea
          showCount
          maxLength={1000}
          placeholder='请输入商品名称'
          rows={3}
          value={formState.productName}
          onChange={e => {
            const value = e.target.value
            const newState = { ...formState, productName: value }
            setFormState(newState)
          }}
        />
      </Form.Item>

      <Form.Item label='商品英文名称：' name='productEnglishName' rules={formRules.productEnglishName}>
        <TextArea
          showCount
          maxLength={1000}
          placeholder='请输入商品英文名称'
          rows={3}
          value={formState.productEnglishName}
          onChange={e => {
            const value = e.target.value
            const newState = { ...formState, productEnglishName: value }
            setFormState(newState)
          }}
        />
      </Form.Item>
    </Form>
  )
})

EditProduct.displayName = 'EditProduct'

export default EditProduct

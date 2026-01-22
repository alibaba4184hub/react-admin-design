import { useState, useEffect, forwardRef, useRef, useImperativeHandle } from 'react'
import { Cascader, message } from 'antd'
import type { CascaderProps } from 'antd'
import { getAllCategoryList } from '@/api/category'
import type { CategoryFilterState } from './category.ts'

interface Option {
  value?: string | number
  label?: React.ReactNode
  disabled?: boolean
  children?: Option[]
  // 标记是否为叶子节点，设置了 `loadData` 时有效
  // 设为 `false` 时会强制标记为父节点，即使当前节点没有 children，也会显示展开图标
  isShow?: number
  // 添加分类相关的属性
  categoryId?: string | number
  categoryName?: React.ReactNode
}
export interface SelectCategoryProps {
  /** 是否多选 */
  multiple?: boolean
  /** 定义选中项回填的方式。Cascader.SHOW_CHILD: 只显示选中的子节点。Cascader.SHOW_PARENT: 只显示父节点（当父节点下所有子节点都选中时）。 */
  showCheckedStrategy?: 'SHOW_CHILD' | 'SHOW_PARENT'
  /** 外部传入的分类列表 */
  categoryList?: CategoryFilterState[]
  /** 选中的分类ID */
  value?: number | string | number[] | string[]
  /** 选中的分类名称（单选时使用） */
  categoryName?: string
  /** 值变化回调 */
  onChange?: (value: (string | number)[], selectedOptions: Option[]) => void
  /** 清空回调 */
  onClear?: () => void
  /** 样式类名 */
  className?: string
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /**自定义 options 中 label value children 的字段 */
  fieldNames?: { label: 'categoryName'; value: 'categoryId'; children: 'children' }
}

export interface SelectCategoryRef {
  /** 店铺选择变化时调用，重新加载分类 */
  //   selectShopChange: (e: any) => void
  /** 手动加载分类 */
  loadCategory: (shopId?: number) => Promise<void>
  /** 是否已加载完成 */
  loaded: boolean
}
const SelectCategory = forwardRef<SelectCategoryRef, SelectCategoryProps>((props, ref) => {
  const {
    categoryList = [],
    multiple = false,
    value,
    showCheckedStrategy = 'SHOW_PARENT',
    categoryName: externalCategoryName,
    onChange,
    fieldNames = { label: 'categoryName', value: 'categoryId', children: 'children' },
    className,
    placeholder = '请选择分类',
    disabled = false
  } = props
  const [options, setOptions] = useState<Option[]>([])
  const cascaderRef = useRef(null)

  const [loaded, setLoaded] = useState(false) // 是否已加载完成
  const [categoryId, setCategoryId] = useState<number[] | string[]>([])
  //   加载数据
  const loadCategory = async (shopId?: number): Promise<void> => {
    if (loaded) return
    try {
      const result: any = await getAllCategoryList(shopId)
      setOptions(result)
      setLoaded(true)
    } catch (error: any) {
      message.error(error.message)
    } finally {
    }
  }
  // 处理值变化
  const handleChange = (value: any, selectedOptions: any[]) => {
    if (multiple) {
      // 多选模式：取每个选中项的最后一个节点ID
      const newArray: number[] = value.map((arr: any[]) => arr[arr.length - 1])
      if (onChange) {
        setCategoryId(value)
        onChange(newArray, selectedOptions)
      }
    } else {
      // 单选模式
      // 调用父组件回调
      if (onChange) {
        const id = value && value.length > 0 ? value[value.length - 1] : 0
        setCategoryId(value)
        onChange(id, selectedOptions)
      }
    }
  }

  // 构建 Cascader 的 props
  const cascaderProps: CascaderProps<Option> = {
    style: { maxWidth: '100%' },
    options,
    fieldNames,
    showCheckedStrategy,
    showSearch: true,
    multiple: multiple || undefined, // 确保在 false 时不传递该属性
    allowClear: true,
    placeholder,
    disabled,
    value: categoryId as any,
    onChange: handleChange,
    className
  }

  useImperativeHandle(ref, () => ({
    loadCategory,
    loaded
  }))

  useEffect(() => {
    if (categoryList.length > 0) {
      setOptions(categoryList)
    } else {
      loadCategory()
    }
  }, [])

  return <Cascader ref={cascaderRef} {...(cascaderProps as any)} />
})

SelectCategory.displayName = 'SelectCategory'

export default SelectCategory

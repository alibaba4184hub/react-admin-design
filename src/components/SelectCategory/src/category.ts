// types/product/category.ts
export interface CategoryFilterState {
  categoryId: number
  categoryName: string
  parentId: number
  children?: CategoryFilterState[]
  isLeaf?: boolean
  [key: string]: any
}

import { isObject } from './is'

export function openWindow(
  url: string,
  opt?: {
    target?: TargetContext | string
    noopener?: boolean
    noreferrer?: boolean
  }
) {
  const { target = '__blank', noopener = true, noreferrer = true } = opt || {}
  const feature: string[] = []

  noopener ? feature.push('noopener=yes') : null
  noreferrer ? feature.push('noreferrer=yes') : null

  window.open(url, target, feature.join(','))
}

export function promiseTimeout(ms: number, throwOnTimeout = false, reason = 'Timeout'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (throwOnTimeout) setTimeout(() => reject(reason), ms)
    else setTimeout(resolve, ms)
  })
}

export const searchRoute: any = (path: string, routes: any = []) => {
  for (const item of routes) {
    if (item.path === path || item.fullPath === path) return item
    if (item.children) {
      const result = searchRoute(path, item.children)
      if (result) return result
    }
  }
  return null
}

export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key])
  }
  return src
}
/**
 *
 * @param data
 * @returns  {AnyObject}
 */
export const formatArguments = (data: any) => {
  const result: any = {}
  if (typeof data === 'object') {
    const dataKeys = Object.keys(data)
    for (const key of dataKeys) {
      const value = data[key]
      // 检查值是否为 null 或 undefined
      if (value === null || value === undefined || value === '') {
        continue
      }
      if (typeof value === 'object') {
        // 如果值是数组，检查其长度是否为 0
        if (Array.isArray(value) && value.length === 0) {
          continue
        } else if (Object.keys(value).length === 0) {
          continue
        }
      }
      result[key] = value
    }
  }
  return result
}


type DictDataType = Record<string, any>;

/**
 * 获得字典数据的文本展示
 *
 * @param map 字典数据的key和value的映射
 * @param dictData 字典数据
 * @param value 字典数据的值
 * @return 字典名称
 */
export const getDictLabel = ({
    map = { label: "label", value: "value" },
    dictData,
    value
}: {
    map?: { label: string; value: string };
    dictData: DictDataType[];
    value: string | number | boolean;
}): string => {
    const dictOptions: DictDataType[] = dictData;
    let dictLabel = "";
    dictOptions.forEach((dict: DictDataType) => {
        if (dict[map.value] == value) {
            dictLabel = dict[map.label];
        }
    });
    return dictLabel;
};
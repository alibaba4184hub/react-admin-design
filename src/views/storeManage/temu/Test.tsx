import { forwardRef, useRef, useState, useMemo } from 'react'

const Input = forwardRef((props, ref) => {
  console.log('input render')
  return <input type='text' ref={ref} />
})
// 性能测试组件
function PerformanceDemo() {
  const [count, setCount] = useState(0)
  const [items] = useState(() => Array.from({ length: 1000 }, (_, i) => ({ id: i, value: Math.random() })))

  // 没有优化：每次渲染都执行
  const startTime1 = performance.now()
  const expensiveResult1 = items
    .filter(item => item.value > 0.5)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
  const duration1 = performance.now() - startTime1

  // 使用 useMemo 优化
  const startTime2 = performance.now()
  const expensiveResult2 = useMemo(() => {
    return items
      .filter(item => item.value > 0.5)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [items]) // 依赖项不变时不会重新计算
  const duration2 = performance.now() - startTime2

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>重新渲染 ({count})</button>
      <div>无优化耗时: {duration1.toFixed(2)}ms</div>
      <div>useMemo 耗时: {duration2.toFixed(2)}ms</div>
      <div>结果长度: {expensiveResult2.length}</div>
    </div>
  )
}

function App() {
  const inputRef = useRef(null)
  function focusHandler() {
    console.log('focus', inputRef)
    inputRef?.current?.focus()
  }

  return (
    <div className='app'>
      this is app
      <PerformanceDemo></PerformanceDemo>
      <button onClick={focusHandler}>focus</button>
      <Input ref={inputRef}></Input>
    </div>
  )
}

export default App

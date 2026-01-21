import { forwardRef, useRef } from 'react'

const Input = forwardRef((props, ref) => {
  console.log('input render')
  return <input type='text' ref={ref} />
})

function App() {
  const inputRef = useRef(null)
  function focusHandler() {
    console.log('focus', inputRef)
    inputRef?.current?.focus()
  }

  return (
    <div className='app'>
      this is app
      <button onClick={focusHandler}>focus</button>
      <Input ref={inputRef}></Input>
    </div>
  )
}

export default App

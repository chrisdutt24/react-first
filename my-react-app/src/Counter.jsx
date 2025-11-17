import { useState } from 'react'

function Counter({ label }) {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2>{label}</h2>
      <p>Aktueller Stand: {count}</p>
      <button onClick={handleClick}>
        +1
      </button>
    </div>
  )
}

export default Counter

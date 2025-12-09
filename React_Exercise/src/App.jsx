import { useState, useEffect } from 'react'
import './App.css'

// Simple rendering example
function HelloComponent() {
  return (
    <div>
      <h2>Hello, Bhuvan!</h2>
      <p>This is a simple rendering example</p>
    </div>
  )
}

// Props example
function PropsExample({ brand, color }) {
  return (
    <div>
      <h3>Props Example</h3>
      <p><strong>I am a {brand} car!</strong></p>
      <p><strong>My favorite color is {color}!</strong></p>
    </div>
  )
}

// State example with color change
function StateExample() {
  const [color, setColor] = useState('Red')
  
  const changeColor = () => {
    setColor(color === 'Red' ? 'Blue' : 'Red')
  }
  
  return (
    <div>
      <button onClick={changeColor} className="btn">Change Color</button>
    </div>
  )
}

// Event example
function EventExample() {
  const shoot = () => {
    alert('Great Shot!')
  }
  
  return (
    <div>
      <h3>Event Example</h3>
      <button onClick={shoot} className="btn">Take the shot!</button>
    </div>
  )
}

// Conditional rendering example
function ConditionalExample() {
  const [isLoggedIn] = useState(true)
  
  return (
    <div>
      <h3>{isLoggedIn ? 'Welcome Back!' : 'Please log in'}</h3>
    </div>
  )
}

// List example
function ListExample() {
  const fruits = ['Apple', 'Banana', 'Cherry']
  
  return (
    <div>
      <h3>List Example</h3>
      <ul>
        {fruits.map((fruit, index) => (
          <li key={index} style={{ color: 'blue' }}>{fruit}</li>
        ))}
      </ul>
    </div>
  )
}

// Effect example with click counter
function EffectExample() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    document.title = `You clicked ${count} times`
  }, [count])
  
  return (
    <div>
      <h3>Effect Example</h3>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)} className="btn">Click Me</button>
    </div>
  )
}

function App() {
  const [color, setColor] = useState('Red')
  
  const changeColor = () => {
    setColor(color === 'Red' ? 'Blue' : 'Red')
  }

  return (
    <div className="App">
      <h1>React Basic Examples</h1>
      
      <HelloComponent />
      
      <PropsExample brand="Tesla" color={color} />
      <StateExample />
      
      <EventExample />
      
      <ConditionalExample />
      
      <ListExample />
      
      <EffectExample />
    </div>
  )
}

export default App

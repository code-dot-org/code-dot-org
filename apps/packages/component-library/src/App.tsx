import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Button} from "@/button";
import Chips from "@/chips";
import {IconDropdown, SimpleDropdown} from "@/dropdown";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <Button onClick={() => setCount((count) => count + 1)} text={`count is ${count}`}>
        </Button>
        <p>
          Code.org Button
        </p>
      </div>
        <div className="card">
            <Chips
                label={"Chips"}
                name="chips"
                required={true}
                options={[{value: "Chip 1", label: "Chip A"}, {value: "2", label: "Chip 2"}, {value: "3", label: "Chip 3"}]}
                values={[]}
                setValues={() => {}}
            />
        </div>
        <div className="card">
            <SimpleDropdown
                name="test1-dropdown"
                items={[{value: "1", text: "option 1"}, {value: "2", text: "option 2"}]}
                selectedValue={"1"}
                onChange={() => {}}
                labelText="Dropdown label"
                size={'l'}
            />
        </div>
    </>
  )
}

export default App

// TODO: 
//  - get classnames working with ts
//  - fix CSS modules with ts

import React, { ReactNode, useContext, useState } from 'react'
import { AppOptions } from './AppOptions'
import './components.scss'
import DropletEditor from './droplet/Droplet'

type LabManagerProps = {
  appOptions: AppOptions
}

let AppOptionsContext: React.Context<AppOptions>

export const LabManager = (props: LabManagerProps) => {
  AppOptionsContext = React.createContext<AppOptions>(props.appOptions)

  // Using a text input to test panel resizing. Changing leftWeight makes the
  // left panel bigger/smaller by setting the element's flex property.
  const [leftWeight, setLeftWeight] = useState<string>('1');

  return (
    <AppOptionsContext.Provider value={props.appOptions}>
      <h1>{props.appOptions.appType}</h1>
      <input type="text" onChange={e => setLeftWeight(e.target.value)} value={leftWeight} />
      <PanelManager leftWeight={Number(leftWeight)}>
        {Applab()}
      </PanelManager>
    </AppOptionsContext.Provider>
  )
}

// TODO: should this be a string-backed enum?
enum PanelDirection {
  Horizontal,
  Vertical
}

type PanelManagerProps = {
  children: ReactNode[]
  dir?: PanelDirection
  leftWeight?: number
}

const PanelManager = ({ children, dir = PanelDirection.Horizontal, leftWeight = 1 }: PanelManagerProps) => {
  return (
    <div className={'panels ' + (dir === PanelDirection.Vertical ? 'vertical' : '')}>
      {children.map((child, i) => (
        <Panel key={i} weight={i === 0 ? leftWeight : 1}>{child}</Panel>
      ))}
    </div>
  )
}

type PanelProps = {
  children: ReactNode
  weight: number
}

const Panel = ({ children, weight }: PanelProps) => {
  return <div className="panel" style={{ flex: weight }}>{children}</div>
}

const Applab: () => Array<ReactNode> = () => {
  const [showEditor, setShowEditor] = useState<boolean>(true)

  return [
    <PanelManager dir={PanelDirection.Vertical} key="left">
      <P5Visualization />
      <RunButton />
    </PanelManager>,
    <PanelManager dir={PanelDirection.Vertical} key="right">
      <Instructions />
      <button onClick={() => setShowEditor(!showEditor)}>toggle editor</button>
      {showEditor && <Editor />}
      <Console />
    </PanelManager>,
  ]
}

const P5Visualization = () => {
  return <div style={{ width: '100%', height: '25px', backgroundColor: 'green' }}></div>
}

const RunButton = () => {
  return <button>Run</button>
}

const Instructions = () => {
  const { longInstructions } = useContext(AppOptionsContext)

  return <div>{longInstructions}</div>
}

const Editor = () => {
  return <DropletEditor />
}

const Console = () => {
  return <div>console...</div>
}
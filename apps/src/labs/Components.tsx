// TODO: 
//  - get classnames working with ts
//  - fix CSS modules with ts

const SafeMarkdown = require('@cdo/apps/templates/SafeMarkdown')

import React, { useContext } from 'react'
import './components.scss'
import { EditorContext } from './Editor'
import { AppOptionsContext } from './LabManager'

export const EditorToggle = () => {
  const { show, setShowEditor } = useContext(EditorContext)

  return <button onClick={() => setShowEditor(!show)}>toggle editor</button>
}

export const Visualization = () => {
  return <div style={{ width: '100%', height: '25px', backgroundColor: 'green' }}></div>
}

export const RunButton = () => {
  return <button>Run</button>
}

export const Instructions = () => {
  const { longInstructions } = useContext(AppOptionsContext)

  return <SafeMarkdown markdown={longInstructions} className="instructions" />
}

export const Console = () => {
  return <div className="console">hi</div>
}

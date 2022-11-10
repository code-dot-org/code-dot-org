// TODO: 
//  - get classnames working with ts
//  - fix CSS modules with ts

const SafeMarkdown = require('@cdo/apps/templates/SafeMarkdown')

import React, { useContext } from 'react'
import './components.scss'
import { EditorContext } from './Editor'
import { AppOptionsContext } from './LabManager'
import { Asset } from './projectApi'

export const EditorToggle = () => {
  const { show, setShowEditor } = useContext(EditorContext)

  return <button onClick={() => setShowEditor(!show)}>toggle editor</button>
}

type VisualizationProps = {
  assets: Asset[]
}

export const Visualization = ({ assets }: VisualizationProps) => {
  let assetSquares = []
  for (let i = 0; i < 9; i++) {
    const src = assets[i]?.src || ''
    assetSquares.push(<img src={src} />)
  }

  return <div className="visualization">{assetSquares}</div>
}

export const RunButton = () => {
  return <button>Run</button>
}

export const Instructions = () => {
  const { longInstructions } = useContext(AppOptionsContext)

  return <SafeMarkdown markdown={longInstructions} className="instructions" />
}

export const Console = () => {
  return <div className="console">console...</div>
}

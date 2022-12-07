// TODO: 
//  - get classnames working with ts
//  - fix CSS modules with ts

const SafeMarkdown = require('@cdo/apps/templates/SafeMarkdown')

import React from 'react'
import './components.scss'
import { Asset } from './projectApi'
import { useAppDispatch, useAppSelector } from './redux/hooks'
import { setShow } from './redux/slices/editorSlice'

export const EditorToggle = () => {
  const show = useAppSelector(state => state.editor.show)
  const dispatch = useAppDispatch()

  return <button onClick={() => dispatch(setShow(!show))}>toggle editor</button>
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
  const { longInstructions } = useAppSelector(state => state.common.appOptions)

  return <SafeMarkdown markdown={longInstructions} className="instructions" />
}

export const Console = () => {
  return <div className="console">console...</div>
}

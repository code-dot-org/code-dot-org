import React from 'react'
import ReactDOM from 'react-dom'
import { createAppOptions } from './AppOptions'
import { LabManager } from './LabManager'

export default function init(appOptions: any, mountElement: HTMLElement) {
  console.log(appOptions)

  ReactDOM.render(
    <LabManager appOptions={createAppOptions(appOptions)} />,
    mountElement
  )
}
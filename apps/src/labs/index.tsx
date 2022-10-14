import React from 'react'
import ReactDOM from 'react-dom'
import { createAppOptions } from './AppOptions'
import { LabManager } from './Components'

// import LabLab from "./LabLab";

// export default function init(appOptions: any, mountElement: HTMLElement) {
//   new LabLab(appOptions, mountElement);
// }

export default function init(appOptions: any, mountElement: HTMLElement) {
  console.log(appOptions)

  ReactDOM.render(
    <LabManager appOptions={createAppOptions(appOptions)} />,
    mountElement
  )
}
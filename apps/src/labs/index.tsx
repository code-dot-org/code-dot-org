import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { createAppOptions } from './AppOptions'
import { LabManager } from './LabManager'

export default function init(appOptions: any, mountElement: HTMLElement) {
  console.log(appOptions)

  ReactDOM.render(
    <Provider store={store}>
      <LabManager appOptions={createAppOptions(appOptions)} />
    </Provider>,
    mountElement
  )
}
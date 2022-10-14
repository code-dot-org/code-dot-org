import ReactDOM from 'react-dom'
import React, { ReactElement } from 'react'
import { AppOptions, createAppOptions } from './AppOptions'

//////////////////////////////
// EDITOR
//////////////////////////////
interface Editor { }

class Droplet implements Editor { }

//////////////////////////////
// LAB
//////////////////////////////
interface Lab {
  editor: Editor;
  render: () => Array<ReactElement>;
}

class Applab implements Lab {
  editor: Droplet;

  constructor() {
    this.editor = new Droplet()
  }

  render(): Array<ReactElement> {
    return [<div>applab</div>]
  }
}

//////////////////////////////
// LABLAB
//////////////////////////////
export default class LabLab {
  appOptions: AppOptions;
  lab: Lab;
  mountElement: HTMLElement;

  constructor(appOptions: any, mountElement: HTMLElement) {
    // ingest appOptions from server
    // should these still go in redux?
    this.appOptions = createAppOptions(appOptions)

    // initialize lab
    this.lab = labFactory(appOptions.appType);

    this.mountElement = mountElement;

    console.log(this)
    this.render();
  }

  render() {
    ReactDOM.render(
      <LabView>
        {this.lab.render()}
      </LabView>,
      this.mountElement
    )
  }
}

function labFactory(type: string): Lab {
  return new Applab()
}

//////////////////////////////
// COMPONENTS
//////////////////////////////
type LabViewProps = {
  children: Array<ReactElement>
}

function LabView({ children }: LabViewProps) {
  return <div>{children}</div>
}

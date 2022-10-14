// Droplet dependencies
// TODO: should paths change for webpack?
require('../../../lib/ace/src-noconflict/ace')
require('../../../lib/ace/src-noconflict/mode-javascript')
require('../../../lib/ace/src-noconflict/ext-language_tools')
require('../../../lib/ace/src-noconflict/theme-chrome')
const droplet = require('../../../lib/droplet/droplet-full')
import '../../../lib/droplet/droplet.min.css'

import React, { useEffect } from 'react'
import './droplet.scss'

type DropletBlock = {
  block: string
  title: string
}

type DropletCategory = {
  name: string
  color: string
  blocks: DropletBlock[]
}

// TODO: make blocks/categories configurable
const forBlock: DropletBlock = {
  block: 'for (var i = 0; i < 4; i++) {\n  __;\n}',
  title: 'repeat some code'
}

const loopsCategory: DropletCategory = {
  name: 'loops',
  color: 'blue',
  blocks: [forBlock]
}

class Droplet {
  container: HTMLElement
  editor: any // TODO: wrap droplet.Editor in a type?

  constructor() {
    this.container = document.createElement('div')
  }

  setEditor() {
    this.editor = new droplet.Editor(this.container, {
      mode: 'javascript',
      palette: [loopsCategory]
    })
  }

  render(ref: HTMLDivElement) {
    ref.appendChild(this.container)

    if (!this.editor) {
      this.setEditor()
    }

    // TODO: clean this up
    // If editor is hidden and screen is resized OR editor is resized
    // via PanelManager (i.e., Window resize event isn't triggered),
    // we have to manually trigger resize event.
    this.editor.resize()
  }
}

// Droplet singleton
// TODO: where/when should this actually be created?
let dropletInst: Droplet = new Droplet()

const DropletEditor = () => {
  const ref = React.createRef<HTMLDivElement>()

  useEffect(() => {
    if (ref.current) {
      dropletInst.render(ref.current)
    }
  }, [ref.current])

  return (
    <div className="dropletContainer">
      <div ref={ref}>droplet will render into this</div>
    </div>
  )
}

export default DropletEditor
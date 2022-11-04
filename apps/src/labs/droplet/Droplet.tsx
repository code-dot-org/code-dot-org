// Droplet dependencies
// TODO: should paths change for webpack?
require('../../../lib/ace/src-noconflict/ace')
require('../../../lib/ace/src-noconflict/mode-javascript')
require('../../../lib/ace/src-noconflict/ext-language_tools')
require('../../../lib/ace/src-noconflict/theme-chrome')
const droplet = require('../../../lib/droplet/droplet-full')
import '../../../lib/droplet/droplet.min.css'

import React, { useEffect } from 'react'
import { DropletCategory } from '../blocks'
import './droplet.scss'

class Droplet {
  blocks: DropletCategory[]
  container: HTMLElement
  editor: any // TODO: wrap droplet.Editor in a type?

  constructor() {
    this.blocks = []
    this.container = document.createElement('div')
  }

  setBlocks(blocks: DropletCategory[]) {
    this.blocks = blocks
  }

  setEditor() {
    this.editor = new droplet.Editor(this.container, {
      mode: 'javascript',
      palette: this.blocks
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

type DropletEditorProps = {
  blocks: DropletCategory[]
}

// new bug: droplet no longer resizes when panel widths change :(
const DropletEditor = ({ blocks }: DropletEditorProps) => {
  const ref = React.createRef<HTMLDivElement>()

  // does this break if block loading is async?
  useEffect(() => {
    dropletInst.setBlocks(blocks)
  }, [blocks])

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
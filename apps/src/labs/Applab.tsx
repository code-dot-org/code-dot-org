import React, { useContext } from 'react'
import { BlockFactory, DropletCategory } from './blocks'
import { Visualization, RunButton, Instructions, EditorToggle, Console } from './Components'
import { Editor, EditorContext, EditorType } from './Editor'
import { PanelDirection, PanelManager } from "./Panels"
import { Lab } from './types'

const LeftPanel = () => {
  return <PanelManager dir={PanelDirection.Vertical} key="left">
    <Visualization />
    <RunButton />
  </PanelManager>
}

type RightPanelProps = {
  blockFactory: BlockFactory
  editorType: EditorType
}

// TODO: this can be used generically... do we want that, though?
// maybe we need to abstract panel configuration/layout one level higher
const RightPanel = ({ blockFactory, editorType }: RightPanelProps) => {
  const { show: showEditor } = useContext(EditorContext)

  return <PanelManager dir={PanelDirection.Vertical} key="right">
    <Instructions />
    <EditorToggle />
    {showEditor && <Editor type={editorType} blockFactory={blockFactory} />}
    <Console />
  </PanelManager>
}

export default class Applab implements Lab {
  editorType = EditorType.Droplet

  blockFactory: () => DropletCategory[] = () => {
    return [
      {
        name: 'loops',
        color: 'blue',
        blocks: [
          {
            block: 'for (var i = 0; i < 4; i++) {\n  __;\n}',
            title: 'repeat some code'
          }
        ]
      }
    ]
  }

  panels = [<LeftPanel />, <RightPanel editorType={this.editorType} blockFactory={this.blockFactory} />]
}

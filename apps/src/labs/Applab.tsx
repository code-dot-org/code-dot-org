import React from 'react'
import { BlockFactory, DropletCategory } from './blocks'
import { Visualization, RunButton, Instructions, Console } from './Components'
import { Editor, EditorType } from './Editor'
import { PanelDirection, PanelManager } from "./Panels"
import { fetchAssets, fetchProject } from './projectApi'
import { useAppSelector } from './redux/hooks'
import { Lab } from './types'

const LeftPanel = () => {
  const assets = useAppSelector(state => state.project.assets)

  return <PanelManager dir={PanelDirection.Vertical}>
    <Visualization assets={assets || []} />
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
  const showEditor = useAppSelector(state => state.editor.show)

  return <PanelManager dir={PanelDirection.Vertical}>
    <Instructions />
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

  panels = [<LeftPanel key="left" />, <RightPanel key="right" editorType={this.editorType} blockFactory={this.blockFactory} />]

  loadProjectData = (channelId: string) => {
    // get project, assets, etc from server
    return Promise.all([fetchProject(channelId), fetchAssets(channelId)])
      .then(([project, assets]) => Promise.resolve({ project, assets }))
  }
}

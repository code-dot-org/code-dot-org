import React from 'react'
import { BlockFactory } from './blocks'
import DropletEditor from "./droplet/Droplet"
import { useAppSelector } from './redux/hooks'

export enum EditorType {
  Droplet,
  Blockly
}

type EditorProps = {
  type: EditorType
  // TODO: javalab doesn't have blocks. should it stub this function
  // or should this be optional?
  blockFactory: BlockFactory
}

export const Editor = (props: EditorProps) => {
  const { type, blockFactory } = props
  const project = useAppSelector(state => state.project.project)

  // probably a better way to do this?
  if (type === EditorType.Droplet) {
    return <DropletEditor blocks={blockFactory()} code={project?.code} />
  }

  return null
}
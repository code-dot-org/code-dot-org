import React, { useContext, useState } from 'react'
import { BlockFactory } from './blocks'
import DropletEditor from "./droplet/Droplet"
import { UserOptionsContext } from './LabManager'

export type EditorOptions = {
  show: boolean
  setShowEditor: (show: boolean) => void
}

// is this a weird way to initialize/set a default for context?
export let EditorContext: React.Context<EditorOptions>
EditorContext = React.createContext<EditorOptions>({
  show: true,
  setShowEditor: (show) => { }
})

export const useEditor: () => EditorOptions = () => {
  const [show, setShowEditor] = useState<boolean>(true)

  return {
    show,
    setShowEditor
  }
}

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
  const { project } = useContext(UserOptionsContext)

  // probably a better way to do this?
  if (type === EditorType.Droplet) {
    return <DropletEditor blocks={blockFactory()} code={project?.code} />
  }

  return null
}
import { ReactNode } from "react"
import { BlockFactory } from "./blocks"
import { EditorType } from "./Editor"

// TODO: should there be an additional interface for [Droplet|Blockly]Lab?
export interface Lab {
  panels: ReactNode[]
  blockFactory: BlockFactory
  editorType: EditorType
}
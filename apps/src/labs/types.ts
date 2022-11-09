import { ReactNode } from "react"
import { BlockFactory } from "./blocks"
import { EditorType } from "./Editor"
import { Asset, Project } from "./projectApi"

export type LoadProjectData = (channelId: string) => Promise<{project: Project, assets: Asset[]}>

// TODO: should there be an additional interface for [Droplet|Blockly]Lab?
export interface Lab {
  // do levels that use level_sources have a channelId?
  loadProjectData: LoadProjectData
  panels: ReactNode[]
  blockFactory: BlockFactory
  editorType: EditorType
}
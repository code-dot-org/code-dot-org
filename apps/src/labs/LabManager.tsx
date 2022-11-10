import React, { useState } from "react"
import { AppOptions, App } from "./AppOptions"
import { EditorToggle } from "./Components"
import { useEditor, EditorContext } from "./Editor"
import labFactory from "./labFactory"
import { PanelManager } from "./Panels"
import { Asset, Project, fakeChannelIds } from "./projectApi"
import useProject from "./useProject"

type LabManagerProps = {
  appOptions: AppOptions
}

// is this a weird way to initialize/set a default for context?
export let AppOptionsContext: React.Context<AppOptions>
AppOptionsContext = React.createContext<AppOptions>({
  appType: App.Applab,
  channel: '',
  longInstructions: '',
  startBlocks: ''
})

type UserOptions = {
  project?: Project,
  assets?: Asset[]
}

export let UserOptionsContext: React.Context<UserOptions>
UserOptionsContext = React.createContext<UserOptions>({
  project: undefined,
  assets: undefined
})

export const LabManager = (props: LabManagerProps) => {
  const { panels, loadProjectData } = labFactory(props.appOptions)
  const { project, assets, fakeChannelId, setFakeChannelId } = useProject(props.appOptions.channel, loadProjectData)
  const { show, setShowEditor } = useEditor()

  // Using a text input to test panel resizing. Changing leftWeight makes the
  // left panel bigger/smaller by setting the element's flex property.
  const [leftWeight, setLeftWeight] = useState<string>('0');

  return (
    <AppOptionsContext.Provider value={props.appOptions}>
      <UserOptionsContext.Provider value={{ project, assets }}>
        <EditorContext.Provider value={{ show, setShowEditor }}>
          <h1>{props.appOptions.appType}</h1>
          <div className="controls">
            <label>
              {`Left panel weight: `}
              <input type="text" className="weightInput" onChange={e => setLeftWeight(e.target.value)} value={leftWeight} />
            </label>
            <label>
              {`Switch channel: `}
              <select value={fakeChannelId} onChange={e => setFakeChannelId(e.target.value)}>
                {fakeChannelIds.map(id => <option value={id}>{id}</option>)}
              </select>
            </label>
            <EditorToggle />
          </div>
          {/* TODO: should direction of this outermost PanelManager be configurable? defaults to horizontal */}
          <PanelManager leftWeight={Number(leftWeight)}>
            {panels.map(p => p)}
          </PanelManager>
        </EditorContext.Provider>
      </UserOptionsContext.Provider>
    </AppOptionsContext.Provider>
  )
}

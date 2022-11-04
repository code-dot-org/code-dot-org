import React, { useState } from "react"
import { AppOptions, App } from "./AppOptions"
import { useEditor, EditorContext } from "./Editor"
import labFactory from "./labFactory"
import { PanelManager } from "./Panels"

type LabManagerProps = {
  appOptions: AppOptions
}

// is this a weird way to initialize/set a default for context?
export let AppOptionsContext: React.Context<AppOptions>
AppOptionsContext = React.createContext<AppOptions>({
  appType: App.Applab,
  longInstructions: '',
  startBlocks: ''
})

export const LabManager = (props: LabManagerProps) => {
  const { show, setShowEditor, code, setCode } = useEditor()

  // Using a text input to test panel resizing. Changing leftWeight makes the
  // left panel bigger/smaller by setting the element's flex property.
  const [leftWeight, setLeftWeight] = useState<string>('1');

  const { panels } = labFactory(props.appOptions)

  return (
    <AppOptionsContext.Provider value={props.appOptions}>
      <EditorContext.Provider value={{ show, setShowEditor, code, setCode }}>
        <h1>{props.appOptions.appType}</h1>
        <input type="text" onChange={e => setLeftWeight(e.target.value)} value={leftWeight} />
        {/* TODO: should direction of this outermost PanelManager be configurable? defaults to horizontal */}
        <PanelManager leftWeight={Number(leftWeight)}>
          {panels.map(p => p)}
        </PanelManager>
      </EditorContext.Provider>
    </AppOptionsContext.Provider>
  )
}

import React, { useEffect, useState } from "react"
import { AppOptions } from "./AppOptions"
import { EditorToggle } from "./Components"
import labFactory from "./labFactory"
import { PanelManager } from "./Panels"
import { fakeChannelIds } from "./projectApi"
import { setAppOptions } from "./redux/slices/commonSlice"
import { useAppDispatch, useAppSelector } from "./redux/hooks"
import { updateProjectState } from "./redux/slices/projectSlice"

type LabManagerProps = {
  appOptions: AppOptions
}

export const LabManager = (props: LabManagerProps) => {
  const { panels, loadProjectData } = labFactory(props.appOptions.appType)

  const dispatch = useAppDispatch()
  dispatch(setAppOptions(props.appOptions))
  const loadProject = (channelId: string) => updateProjectState(dispatch, loadProjectData, channelId)

  // Channel ID is faked for now
  useEffect(() => {
    loadProject(fakeChannelIds[0])
  }, [])

  const channelId = useAppSelector(state => state.project.channelId)

  // Using a text input to test panel resizing. Changing leftWeight makes the
  // left panel bigger/smaller by setting the element's flex property.
  const [leftWeight, setLeftWeight] = useState<string>('0');

  return (
    <>
      <h1>{props.appOptions.appType}</h1>
      <div className="controls">
        <label>
          {`Left panel weight: `}
          <input type="text" className="weightInput" onChange={e => setLeftWeight(e.target.value)} value={leftWeight} />
        </label>
        <label>
          {`Switch channel: `}
          <select value={channelId} onChange={e => loadProject(e.target.value)}>
            {fakeChannelIds.map(id => <option value={id}>{id}</option>)}
          </select>
        </label>
        <EditorToggle />
      </div>
      {/* TODO: should direction of this outermost PanelManager be configurable? defaults to horizontal */}
      <PanelManager leftWeight={Number(leftWeight)}>
        {panels.map(p => p)}
      </PanelManager>
    </>
  )
}

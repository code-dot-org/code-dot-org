import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Asset, Project } from "../../projectApi"
import { LoadProjectData } from "../../types"
import { AppDispatch } from "../store"

type ProjectState = {
  assets?: Asset[]
  channelId?: string
  project?: Project
}

const initialState: ProjectState = {
  assets: undefined,
  channelId: undefined,
  project: undefined
}

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setAssets:(state, action: PayloadAction<Asset[]>) => {
      state.assets = action.payload
    },
    setChannelId:(state, action: PayloadAction<string>) => {
      state.channelId = action.payload
    },
    setProject:(state, action: PayloadAction<Project>) => {
      state.project = action.payload
    },
  }
})

// All actions are internal
const {setAssets, setChannelId, setProject} = projectSlice.actions
export default projectSlice.reducer

export function updateProjectState(dispatch: AppDispatch, loader: LoadProjectData, channelId: string) {
  loader(channelId).then(result => {
    dispatch(setChannelId(channelId))
    dispatch(setAssets(result.assets))
    dispatch(setProject(result.project))
  })
}
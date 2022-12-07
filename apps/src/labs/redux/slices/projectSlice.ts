import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Asset, Project } from "../../projectApi"
import { LoadProjectData } from "../../types"
import { useAppDispatch, useAppSelector } from "../hooks"
import { AppDispatch } from "../store"

type ProjectState = {
  assets?: Asset[]
  channelId?: string
  // TODO: project.project is weird
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
    setProjectState: (state, action: PayloadAction<ProjectState>) => {
      const {assets, channelId, project} = action.payload
      state.assets = assets
      state.channelId = channelId
      state.project = project
    }
  }
})

export const {setProjectState} = projectSlice.actions
export default projectSlice.reducer

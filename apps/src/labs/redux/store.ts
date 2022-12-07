// Taken from https://redux-toolkit.js.org/tutorials/typescript
import { configureStore } from '@reduxjs/toolkit'
import commonReducer from './slices/commonSlice'
import editorReducer from './slices/editorSlice'
import projectReducer from './slices/projectSlice'

export const store = configureStore({
  reducer: {
    common: commonReducer,
    editor: editorReducer,
    project: projectReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
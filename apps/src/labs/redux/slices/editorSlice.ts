import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type EditorState = {
  show: boolean
}

const initialState: EditorState = {
  show: true
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setShow: (state, action: PayloadAction<boolean>) => {
      state.show = action.payload
    }
  }
})

export const {setShow} = editorSlice.actions
export default editorSlice.reducer
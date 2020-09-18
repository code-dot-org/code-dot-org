// Action types

const SET_IMPORTED_DATA = "SET_IMPORTED_DATA";

// Action creators

export function setImportedData(data) {
  console.log("setImportedData was called");
  return { type: SET_IMPORTED_DATA, data };
}

const initialState = {
  data: undefined
};

// Reducer

export default function rootReducer(state = initialState, action) {
  if (action.type === SET_IMPORTED_DATA) {
    return {
      ...state,
      data: action.data
    };
  }
  return state;
}

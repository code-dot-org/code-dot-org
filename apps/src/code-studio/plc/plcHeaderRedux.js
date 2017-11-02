const SET_PLC_HEADER = 'plcHeader/SET_PLC_HEADER';
export const setPlcHeader = (unitName, courseViewPath) => ({
  type: SET_PLC_HEADER,
  unitName,
  courseViewPath
});

const initialState = {
  unitName: '',
  courseViewPath: '',
};

export default function plcHeader(state=initialState, action) {
  if (action.type === SET_PLC_HEADER) {
    return {
      unitName: action.unitName,
      courseViewPath: action.courseViewPath
    };
  }

  return state;
}

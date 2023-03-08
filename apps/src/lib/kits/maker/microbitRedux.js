const SET_MICROBIT_FIRMATA_UPDATE_PERCENT =
  'microbit/SET_MICROBIT_FIRMATA_UPDATE_PERCENT';

const initialState = {
  microbitFirmataUpdatePercent: null
};

export default (state = initialState, action) => {
  if (action.type === SET_MICROBIT_FIRMATA_UPDATE_PERCENT) {
    return {
      ...state,
      microbitFirmataUpdatePercent: action.percent
    };
  }
  return state;
};

export const setMicrobitFirmataUpdatePercent = percent => ({
  type: SET_MICROBIT_FIRMATA_UPDATE_PERCENT,
  percent
});

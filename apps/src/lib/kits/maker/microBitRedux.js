const SET_MICROBIT_FIRMATA_UPDATE_PERCENT =
  'microBit/SET_MICROBIT_FIRMATA_UPDATE_PERCENT';

const initialState = {
  microBitFirmataUpdatePercent: 0,
};

export default (state = initialState, action) => {
  if (action.type === SET_MICROBIT_FIRMATA_UPDATE_PERCENT) {
    return {
      ...state,
      microBitFirmataUpdatePercent: action.percent,
    };
  }
  return state;
};

export const setMicroBitFirmataUpdatePercent = percent => ({
  type: SET_MICROBIT_FIRMATA_UPDATE_PERCENT,
  percent,
});

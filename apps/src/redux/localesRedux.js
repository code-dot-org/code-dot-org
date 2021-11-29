// Action type constants

const SET_LOCALE_CODE = 'locale/SET_LOCALE_CODE';

// Action creators

export const setLocaleCode = localeCode => ({
  type: SET_LOCALE_CODE,
  localeCode
});

// Initial state of localesRedux

const initialState = {
  // locale code like 'en-US', 'es-MX', or null if none is specified.
  localeCode: null
};

export default function reducer(state = initialState, action) {
  if (action.type === SET_LOCALE_CODE) {
    return {
      ...state,
      localeCode: action.localeCode
    };
  }
  return state;
}

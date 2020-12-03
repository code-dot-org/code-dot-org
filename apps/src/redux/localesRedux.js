// Action type constants

const SET_LOCALE_CODE = 'locale/SET_LOCALE_CODE';
const SET_LOCALE_ENGLISH_NAME = 'locale/SET_LOCALE_ENGLISH_NAME';

// Action creators

export const setLocaleCode = localeCode => ({
  type: SET_LOCALE_CODE,
  localeCode
});

export const setLocaleEnglishName = localeEnglishName => ({
  type: SET_LOCALE_ENGLISH_NAME,
  localeEnglishName
});

// Initial state of localesRedux

const initialState = {
  // locale code like 'en-US', 'es-MX', or null if none is specified.
  localeCode: null,
  // The english name for this locale.
  localeEnglishName: null
};

export default function reducer(state = initialState, action) {
  if (action.type === SET_LOCALE_CODE) {
    return {
      ...state,
      localeCode: action.localeCode
    };
  }
  if (action.type === SET_LOCALE_ENGLISH_NAME) {
    return {
      ...state,
      localeEnglishName: action.localeEnglishName
    };
  }
  return state;
}

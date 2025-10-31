import type {ThunkAction} from 'redux-thunk';

import type {RootState} from '@cdo/apps/types/redux';

import type {
  TeachingProfileDataState,
  TeachingProfileState,
} from './TeachingProfileState';

const SET_TEACHING_PROFILE_DATA = 'teachingProfile/SET_TEACHING_PROFILE_DATA';
const SET_TEACHING_PROFILE_LOADING =
  'teachingProfile/SET_TEACHING_PROFILE_LOADING';
const SET_TEACHING_PROFILE_ERROR = 'teachingProfile/SET_TEACHING_PROFILE_ERROR';

interface SetTeachingProfileDataAction {
  type: typeof SET_TEACHING_PROFILE_DATA;
  data: TeachingProfileDataState | null;
  exists: boolean;
}

interface SetTeachingProfileLoadingAction {
  type: typeof SET_TEACHING_PROFILE_LOADING;
  loading: boolean;
}

interface SetTeachingProfileErrorAction {
  type: typeof SET_TEACHING_PROFILE_ERROR;
  error: string | null;
}

type TeachingProfileActions =
  | SetTeachingProfileDataAction
  | SetTeachingProfileLoadingAction
  | SetTeachingProfileErrorAction;

const API_ENDPOINT = '/teaching_profile_data';

const initialState: TeachingProfileState = {
  data: null,
  loading: false,
  error: null,
  exists: false,
  hasFetched: false,
};

export default function teachingProfile(
  state = initialState,
  action: TeachingProfileActions
): TeachingProfileState {
  if (action.type === SET_TEACHING_PROFILE_LOADING) {
    return {
      ...state,
      loading: action.loading,
    };
  }

  if (action.type === SET_TEACHING_PROFILE_DATA) {
    return {
      ...state,
      data: action.data,
      exists: action.exists,
      loading: false,
      error: null,
      hasFetched: true,
    };
  }

  if (action.type === SET_TEACHING_PROFILE_ERROR) {
    return {
      ...state,
      error: action.error,
      loading: false,
      hasFetched: true,
    };
  }

  return state;
}

export const setTeachingProfileData = (
  data: TeachingProfileDataState | null,
  exists = true
): SetTeachingProfileDataAction => ({
  type: SET_TEACHING_PROFILE_DATA,
  data,
  exists,
});

export const setTeachingProfileLoading = (
  loading: boolean
): SetTeachingProfileLoadingAction => ({
  type: SET_TEACHING_PROFILE_LOADING,
  loading,
});

export const setTeachingProfileError = (
  error: string | null
): SetTeachingProfileErrorAction => ({
  type: SET_TEACHING_PROFILE_ERROR,
  error,
});

export const fetchTeachingProfileData = (): ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  TeachingProfileActions
> => {
  return async dispatch => {
    dispatch(setTeachingProfileLoading(true));

    try {
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');

      const headers: HeadersInit = csrfToken ? {'X-CSRF-Token': csrfToken} : {};

      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers,
        credentials: 'same-origin',
      });

      if (response.status === 401) {
        dispatch(setTeachingProfileData(null, false));
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch teaching profile data');
      }

      const result = await response.json();

      if (result.exists && result.data) {
        dispatch(setTeachingProfileData(result.data, true));
      } else {
        dispatch(setTeachingProfileData(null, false));
      }
    } catch (error) {
      console.error('Failed to fetch teaching profile data:', error);
      const message =
        error instanceof Error ? error.message : 'Unknown error fetching data';
      dispatch(setTeachingProfileError(message));
    }
  };
};

export const selectTeachingProfileState = (state: RootState) =>
  state.teachingProfile;
export const selectTeachingProfileData = (state: RootState) =>
  state.teachingProfile.data;
export const selectTeachingProfileExists = (state: RootState) =>
  state.teachingProfile.exists;
export const selectTeachingProfileLoading = (state: RootState) =>
  state.teachingProfile.loading;
export const selectTeachingProfileHasFetched = (state: RootState) =>
  state.teachingProfile.hasFetched;
export const selectTeachingProfileError = (state: RootState) =>
  state.teachingProfile.error;

export const serializeTeachingProfileData = (
  data: Partial<TeachingProfileDataState> & {
    dateYearsTeachingSet?: string | Date | null;
  }
): TeachingProfileDataState => ({
  ...data,
  dateYearsTeachingSet: data.dateYearsTeachingSet
    ? data.dateYearsTeachingSet instanceof Date
      ? data.dateYearsTeachingSet.toISOString()
      : new Date(data.dateYearsTeachingSet).toISOString()
    : null,
});

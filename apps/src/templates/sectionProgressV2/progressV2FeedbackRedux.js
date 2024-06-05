import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

const PROGRESS_V2_FEEDBACK_URL = '/new_feature_feedback';
const PROGRESS_V2_FEEDBACK_KEY = 'progress_v2';
const PROGRESS_V2_FEEDBACK_FETCH_REQUEST = 'progressv2/feedback/fetchRequest';
const PROGRESS_V2_FEEDBACK_FETCH_SUCCESS = 'progressv2/feedback/fetchSuccess';
const PROGRESS_V2_FEEDBACK_FETCH_FAILURE = 'progressv2/feedback/fetchFailure';
const PROGRESS_V2_FEEDBACK_CREATE_REQUEST = 'progressv2/feedback/createRequest';
const PROGRESS_V2_FEEDBACK_CREATE_SUCCESS = 'progressv2/feedback/createSuccess';
const PROGRESS_V2_FEEDBACK_CREATE_FAILURE = 'progressv2/feedback/createFailure';

const initialState = {
  isLoading: false,
  progressV2Feedback: null,
};

export default function progressV2Feedback(state = initialState, action) {
  switch (action.type) {
    case PROGRESS_V2_FEEDBACK_CREATE_REQUEST:
    case PROGRESS_V2_FEEDBACK_FETCH_REQUEST:
      return {...state, isLoading: true};
    case PROGRESS_V2_FEEDBACK_FETCH_SUCCESS:
    case PROGRESS_V2_FEEDBACK_CREATE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        progressV2Feedback: action.progressV2Feedback,
      };
    case PROGRESS_V2_FEEDBACK_FETCH_FAILURE:
    case PROGRESS_V2_FEEDBACK_CREATE_FAILURE:
      return {...state, isLoading: false, error: action.error};
    default:
      return state;
  }
}

export const fetchProgressV2Feedback = () => dispatch => {
  dispatch({type: PROGRESS_V2_FEEDBACK_FETCH_REQUEST});

  const url = `${PROGRESS_V2_FEEDBACK_URL}?form_key=${PROGRESS_V2_FEEDBACK_KEY}`;

  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch feedback');
      return response.json();
    })
    .then(progressV2Feedback => {
      dispatch({
        type: PROGRESS_V2_FEEDBACK_FETCH_SUCCESS,
        progressV2Feedback: !progressV2Feedback
          ? {empty: true}
          : progressV2Feedback,
      });
    })
    .catch(error => {
      dispatch({
        type: PROGRESS_V2_FEEDBACK_FETCH_FAILURE,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    });
};

export const createProgressV2Feedback = satisfied => async dispatch => {
  dispatch({type: PROGRESS_V2_FEEDBACK_CREATE_REQUEST});

  fetch(PROGRESS_V2_FEEDBACK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': await getAuthenticityToken(),
    },
    body: JSON.stringify({
      feedback: {
        form_key: PROGRESS_V2_FEEDBACK_KEY,
        satisfied,
      },
    }),
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to create feedback');
      return response.json();
    })
    .then(progressV2Feedback => {
      dispatch({
        type: PROGRESS_V2_FEEDBACK_CREATE_SUCCESS,
        progressV2Feedback,
      });
    })
    .catch(error => {
      dispatch({
        type: PROGRESS_V2_FEEDBACK_CREATE_FAILURE,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    });
};

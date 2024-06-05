import {Dispatch} from 'react';

import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

const LTI_FEEDBACK_URL = '/lti/v1/feedback';
const LTI_FEEDBACK_FETCH_REQUEST = 'lti/feedback/fetchRequest';
const LTI_FEEDBACK_FETCH_SUCCESS = 'lti/feedback/fetchSuccess';
const LTI_FEEDBACK_FETCH_FAILURE = 'lti/feedback/fetchFailure';
const LTI_FEEDBACK_CREATE_REQUEST = 'lti/feedback/createRequest';
const LTI_FEEDBACK_CREATE_SUCCESS = 'lti/feedback/createSuccess';
const LTI_FEEDBACK_CREATE_FAILURE = 'lti/feedback/createFailure';

type LtiFeedbackAction =
  | {type: typeof LTI_FEEDBACK_FETCH_REQUEST}
  | {type: typeof LTI_FEEDBACK_FETCH_SUCCESS; ltiFeedback: LtiFeedback | null}
  | {type: typeof LTI_FEEDBACK_FETCH_FAILURE; error: string}
  | {type: typeof LTI_FEEDBACK_CREATE_REQUEST}
  | {type: typeof LTI_FEEDBACK_CREATE_SUCCESS; ltiFeedback: LtiFeedback}
  | {type: typeof LTI_FEEDBACK_CREATE_FAILURE; error: string};

interface LtiFeedback {
  id?: number;
  satisfied: boolean;
  locale?: string;
  early_access?: boolean;
}

interface LtiFeedbackState {
  isLoading: boolean;
  ltiFeedback?: LtiFeedback | null;
  error?: string;
}

export function ltiFeedbackReducer(
  state: LtiFeedbackState,
  action: LtiFeedbackAction
): LtiFeedbackState {
  switch (action.type) {
    case LTI_FEEDBACK_FETCH_REQUEST:
      return {...state, isLoading: true};
    case LTI_FEEDBACK_FETCH_SUCCESS:
      return {...state, isLoading: false, ltiFeedback: action.ltiFeedback};
    case LTI_FEEDBACK_FETCH_FAILURE:
      return {...state, isLoading: false, error: action.error};
    case LTI_FEEDBACK_CREATE_REQUEST:
      return {...state, isLoading: true};
    case LTI_FEEDBACK_CREATE_SUCCESS:
      return {...state, isLoading: false, ltiFeedback: action.ltiFeedback};
    case LTI_FEEDBACK_CREATE_FAILURE:
      return {...state, isLoading: false, error: action.error};
    default:
      return state;
  }
}

export const fetchLtiFeedback = (dispatch: Dispatch<LtiFeedbackAction>) => {
  dispatch({type: LTI_FEEDBACK_FETCH_REQUEST});

  fetch(LTI_FEEDBACK_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch feedback');
      return response.json();
    })
    .then(ltiFeedback => {
      dispatch({
        type: LTI_FEEDBACK_FETCH_SUCCESS,
        ltiFeedback,
      });
    })
    .catch(error => {
      dispatch({
        type: LTI_FEEDBACK_FETCH_FAILURE,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    });
};

export const createLtiFeedback = async (
  dispatch: Dispatch<LtiFeedbackAction>,
  ltiFeedback: LtiFeedback
) => {
  dispatch({type: LTI_FEEDBACK_CREATE_REQUEST});

  fetch(LTI_FEEDBACK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': await getAuthenticityToken(),
    },
    body: JSON.stringify({lti_feedback: ltiFeedback}),
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to create feedback');
      return response.json();
    })
    .then(ltiFeedback => {
      dispatch({
        type: LTI_FEEDBACK_CREATE_SUCCESS,
        ltiFeedback,
      });
    })
    .catch(error => {
      dispatch({
        type: LTI_FEEDBACK_CREATE_FAILURE,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    });
};

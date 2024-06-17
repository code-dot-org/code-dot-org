import {Dispatch} from 'react';

import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import i18n from '@cdo/locale';

const FETCH_PENDING_PERMISSION_REQUEST_URL =
  '/policy_compliance/pending_permission_request';
const FETCH_PENDING_PERMISSION_REQUEST_PERFORM =
  'fetchPendingPermissionRequest/perform';
const FETCH_PENDING_PERMISSION_REQUEST_SUCCESS =
  'fetchPendingPermissionRequest/success';
const FETCH_PENDING_PERMISSION_REQUEST_FAILURE =
  'fetchPendingPermissionRequest/failure';

const REQUEST_PARENTAL_PERMISSION_URL =
  '/policy_compliance/child_account_consent';
const REQUEST_PARENTAL_PERMISSION_PERFORM = 'requestParentalPermission/perform';
export const REQUEST_PARENTAL_PERMISSION_SUCCESS =
  'requestParentalPermission/success';
const REQUEST_PARENTAL_PERMISSION_FAILURE = 'requestParentalPermission/failure';

const RESET_PARENTAL_PERMISSION_REQUEST = 'resetParentalPermissionRequest';

export interface ParentalPermissionRequest {
  parent_email: string;
  requested_at: string;
  resends_sent: number;
  consent_status: string;
}

type ParentalPermissionRequestAction =
  | {
      type: typeof RESET_PARENTAL_PERMISSION_REQUEST;
    }
  | {
      type: typeof FETCH_PENDING_PERMISSION_REQUEST_PERFORM;
    }
  | {
      type: typeof FETCH_PENDING_PERMISSION_REQUEST_SUCCESS;
      parentalPermissionRequest: ParentalPermissionRequest | null;
    }
  | {
      type: typeof FETCH_PENDING_PERMISSION_REQUEST_FAILURE;
      error: string;
    }
  | {
      type: typeof REQUEST_PARENTAL_PERMISSION_PERFORM;
    }
  | {
      type: typeof REQUEST_PARENTAL_PERMISSION_SUCCESS;
      parentalPermissionRequest: ParentalPermissionRequest;
    }
  | {
      type: typeof REQUEST_PARENTAL_PERMISSION_FAILURE;
      error: string;
    };

export interface ParentalPermissionRequestState {
  action?: string | null;
  isLoading: boolean;
  parentalPermissionRequest?: ParentalPermissionRequest | null;
  error?: string | null;
}

export default function parentalPermissionRequestReducer(
  state: ParentalPermissionRequestState,
  action: ParentalPermissionRequestAction
): ParentalPermissionRequestState {
  switch (action.type) {
    case RESET_PARENTAL_PERMISSION_REQUEST:
      return {
        isLoading: false,
      };
    case FETCH_PENDING_PERMISSION_REQUEST_PERFORM:
      return {
        ...state,
        action: action.type,
        isLoading: true,
        error: null,
      };
    case FETCH_PENDING_PERMISSION_REQUEST_SUCCESS:
      return {
        ...state,
        action: action.type,
        isLoading: false,
        parentalPermissionRequest: action.parentalPermissionRequest,
      };
    case FETCH_PENDING_PERMISSION_REQUEST_FAILURE:
      return {
        ...state,
        action: action.type,
        isLoading: false,
        error: action.error,
      };
    case REQUEST_PARENTAL_PERMISSION_PERFORM:
      return {
        ...state,
        action: action.type,
        isLoading: true,
        error: null,
      };
    case REQUEST_PARENTAL_PERMISSION_SUCCESS:
      return {
        ...state,
        action: action.type,
        isLoading: false,
        parentalPermissionRequest: action.parentalPermissionRequest,
      };
    case REQUEST_PARENTAL_PERMISSION_FAILURE:
      return {
        ...state,
        action: action.type,
        isLoading: false,
        error: action.error,
      };
    default:
      return state;
  }
}

export const fetchPendingPermissionRequest = async (
  dispatch: Dispatch<ParentalPermissionRequestAction>
) => {
  try {
    dispatch({type: FETCH_PENDING_PERMISSION_REQUEST_PERFORM});

    const response = await fetch(FETCH_PENDING_PERMISSION_REQUEST_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw i18n.formServerError();

    dispatch({
      type: FETCH_PENDING_PERMISSION_REQUEST_SUCCESS,
      parentalPermissionRequest:
        response.status === 204 ? null : await response.json(),
    });
  } catch (error) {
    dispatch({
      type: FETCH_PENDING_PERMISSION_REQUEST_FAILURE,
      error: error instanceof Error ? i18n.formServerError() : error,
    });
  }
};

export const requestParentalPermission = async (
  dispatch: Dispatch<ParentalPermissionRequestAction>,
  parentEmail: string
) => {
  try {
    dispatch({type: REQUEST_PARENTAL_PERMISSION_PERFORM});

    const response = await fetch(REQUEST_PARENTAL_PERMISSION_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify({'parent-email': parentEmail}),
    });

    const responseData = await response.json();
    if (!response.ok) throw responseData.error || i18n.formServerError();

    dispatch({
      type: REQUEST_PARENTAL_PERMISSION_SUCCESS,
      parentalPermissionRequest: responseData,
    });
  } catch (error) {
    dispatch({
      type: REQUEST_PARENTAL_PERMISSION_FAILURE,
      error: error instanceof Error ? i18n.formServerError() : error,
    });
  }
};

export const resetParentalPermissionRequest = (
  dispatch: Dispatch<ParentalPermissionRequestAction>
) => dispatch({type: RESET_PARENTAL_PERMISSION_REQUEST});

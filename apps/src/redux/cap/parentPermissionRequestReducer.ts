import {Dispatch} from 'react';

import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import i18n from '@cdo/locale';

const FETCH_PENDING_PERMISSION_REQUEST_URL =
  '/policy_compliance/pending_permission_request';
const FETCH_PENDING_PERMISSION_REQUEST_PERFORM =
  'cap/fetchPendingPermissionRequest/perform';
const FETCH_PENDING_PERMISSION_REQUEST_SUCCESS =
  'cap/fetchPendingPermissionRequest/success';
const FETCH_PENDING_PERMISSION_REQUEST_FAILURE =
  'cap/fetchPendingPermissionRequest/failure';

const REQUEST_PARENT_PERMISSION_URL =
  '/policy_compliance/child_account_consent';
const REQUEST_PARENT_PERMISSION_PERFORM = 'cap/requestParentPermission/perform';
export const REQUEST_PARENT_PERMISSION_SUCCESS =
  'cap/requestParentPermission/success';
const REQUEST_PARENT_PERMISSION_FAILURE = 'cap/requestParentPermission/failure';

interface ParentPermissionRequest {
  parent_email: string;
  requested_at: string;
  resends_sent: number;
  consent_status: string;
}

type ParentPermissionRequestAction =
  | {
      type: typeof FETCH_PENDING_PERMISSION_REQUEST_PERFORM;
    }
  | {
      type: typeof FETCH_PENDING_PERMISSION_REQUEST_SUCCESS;
      parentPermissionRequest: ParentPermissionRequest | null;
    }
  | {
      type: typeof FETCH_PENDING_PERMISSION_REQUEST_FAILURE;
      error: string;
    }
  | {
      type: typeof REQUEST_PARENT_PERMISSION_PERFORM;
    }
  | {
      type: typeof REQUEST_PARENT_PERMISSION_SUCCESS;
      parentPermissionRequest: ParentPermissionRequest;
    }
  | {
      type: typeof REQUEST_PARENT_PERMISSION_FAILURE;
      error: string;
    };

export interface ParentPermissionRequestState {
  action?: string | null;
  isLoading: boolean;
  parentPermissionRequest?: ParentPermissionRequest | null;
  error?: string | null;
}

export default function parentPermissionRequestReducer(
  state: ParentPermissionRequestState,
  action: ParentPermissionRequestAction
): ParentPermissionRequestState {
  switch (action.type) {
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
        parentPermissionRequest: action.parentPermissionRequest,
      };
    case FETCH_PENDING_PERMISSION_REQUEST_FAILURE:
      return {
        ...state,
        action: action.type,
        isLoading: false,
        error: action.error,
      };
    case REQUEST_PARENT_PERMISSION_PERFORM:
      return {
        ...state,
        action: action.type,
        isLoading: true,
        error: null,
      };
    case REQUEST_PARENT_PERMISSION_SUCCESS:
      return {
        ...state,
        action: action.type,
        isLoading: false,
        parentPermissionRequest: action.parentPermissionRequest,
      };
    case REQUEST_PARENT_PERMISSION_FAILURE:
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

export const fetchPendingPermissionRequest = (
  dispatch: Dispatch<ParentPermissionRequestAction>
) => {
  dispatch({type: FETCH_PENDING_PERMISSION_REQUEST_PERFORM});

  fetch(FETCH_PENDING_PERMISSION_REQUEST_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) throw i18n.formServerError();
      if (response.status === 204) return null;
      return response.json();
    })
    .then(parentPermissionRequest => {
      dispatch({
        type: FETCH_PENDING_PERMISSION_REQUEST_SUCCESS,
        parentPermissionRequest,
      });
    })
    .catch(error => {
      console.error(FETCH_PENDING_PERMISSION_REQUEST_FAILURE, error);

      dispatch({
        type: FETCH_PENDING_PERMISSION_REQUEST_FAILURE,
        error: error instanceof Error ? i18n.formServerError() : error,
      });
    });
};

export const requestParentPermission = async (
  dispatch: Dispatch<ParentPermissionRequestAction>,
  parentEmail: string
) => {
  dispatch({type: REQUEST_PARENT_PERMISSION_PERFORM});

  fetch(REQUEST_PARENT_PERMISSION_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': await getAuthenticityToken(),
    },
    body: JSON.stringify({'parent-email': parentEmail}),
  })
    .then(async response => {
      if (response.ok) {
        return response.json();
      } else {
        const responseData = await response.json();
        throw responseData.error || i18n.formServerError();
      }
    })
    .then(parentPermissionRequest => {
      dispatch({
        type: REQUEST_PARENT_PERMISSION_SUCCESS,
        parentPermissionRequest,
      });
    })
    .catch(error => {
      console.error(REQUEST_PARENT_PERMISSION_FAILURE, error);

      dispatch({
        type: REQUEST_PARENT_PERMISSION_FAILURE,
        error: error instanceof Error ? i18n.formServerError() : error,
      });
    });
};

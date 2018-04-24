import {
  UnmatchedPartnerLabel,
  UnmatchedPartnerValue
} from './constants';

const SET_REGIONAL_PARTNER_FILTER = 'application_dashboard/SET_REGIONAL_PARTNER_FILTER';
const SET_REGIONAL_PARTNER_GROUP = 'application_dashboard/SET_REGIONAL_PARTNER_GROUP';
const SET_REGIONAL_PARTNERS = 'application_dashboard/SET_REGIONAL_PARTNERS';
const SET_WORKSHOP_ADMIN_PERMISSION = 'application_dashboard/SET_WORKSHOP_ADMIN_PERMISSION';
const SET_LOCK_APPLICATION_PERMISSION = 'application_dashboard/SET_LOCK_APPLICATION_PERMISSION';

const initialState = {
  regionalPartnerFilter: JSON.parse(sessionStorage.getItem("regionalPartnerFilter")) || {value: UnmatchedPartnerValue, label: UnmatchedPartnerLabel},
  regionalPartnerGroup: null,
  regionalPartners: [],
  permissions: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_REGIONAL_PARTNER_FILTER:
      sessionStorage.setItem("regionalPartnerFilter", JSON.stringify(action.filter));
      return {
        ...state,
        regionalPartnerFilter: action.filter
      };

    case SET_REGIONAL_PARTNER_GROUP:
      return {
        ...state,
        regionalPartnerGroup: action.group
      };

    case SET_REGIONAL_PARTNERS:
      return {
        ...state,
        regionalPartners: action.partners
      };

    case SET_WORKSHOP_ADMIN_PERMISSION:
      return {
        ...state,
        permissions: {
          ...state.permissions,
          workshopAdmin: action.enabled
        }
      };

    case SET_LOCK_APPLICATION_PERMISSION:
      return {
        ...state,
        permissions: {
          ...state.permissions,
          lockApplication: action.enabled
        }
      };

    default:
      return state;
  }
}

export const setRegionalPartnerFilter = (filter) => ({
  type: SET_REGIONAL_PARTNER_FILTER,
  filter
});

export const setRegionalPartnerGroup = (group) => ({
  type: SET_REGIONAL_PARTNER_GROUP,
  group
});

export const setRegionalPartners = (partners) => ({
  type: SET_REGIONAL_PARTNERS,
  partners
});

export const setWorkshopAdminPermission = (enabled) => ({
  type: SET_WORKSHOP_ADMIN_PERMISSION,
  enabled
});

export const setLockApplicationPermission = (enabled) => ({
  type: SET_LOCK_APPLICATION_PERMISSION,
  enabled
});

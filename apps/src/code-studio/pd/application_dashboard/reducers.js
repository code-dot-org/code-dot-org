import { AllPartnersLabel } from './constants';

const SET_REGIONAL_PARTNER_NAME = 'application_dashboard/SET_REGIONAL_PARTNER_NAME';
const SET_REGIONAL_PARTNERS = 'application_dashboard/SET_REGIONAL_PARTNERS';
const SET_WORKSHOP_ADMIN_PERMISSION = 'application_dashboard/SET_WORKSHOP_ADMIN_PERMISSION';

const initialState = {
  regionalPartnerName: AllPartnersLabel,
  regionalPartners: [],
  permissions: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_REGIONAL_PARTNER_NAME:
      return {
        ...state,
        regionalPartnerName: action.name
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

    default:
      return state;
  }
}

export const setRegionalPartnerName = (name) => ({
  type: SET_REGIONAL_PARTNER_NAME,
  name
});

export const setRegionalPartners = (partners) => ({
  type: SET_REGIONAL_PARTNERS,
  partners
});

export const setWorkshopAdminPermission = (enabled) => ({
  type: SET_WORKSHOP_ADMIN_PERMISSION,
  enabled
});

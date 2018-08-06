import {ALL_PARTNERS_OPTION, UNMATCHED_PARTNER_OPTION} from "./regional_partner_dropdown";

const SET_REGIONAL_PARTNER_FILTER = 'application_dashboard/SET_REGIONAL_PARTNER_FILTER';
const SET_REGIONAL_PARTNER_GROUP = 'application_dashboard/SET_REGIONAL_PARTNER_GROUP';
const SET_REGIONAL_PARTNERS = 'application_dashboard/SET_REGIONAL_PARTNERS';

const initialState = {
  regionalPartnerFilter: null,
  regionalPartnerGroup: null,
  regionalPartners: [],
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

export function getInitialRegionalPartnerFilter(isWorkshopAdmin, regionalPartners, defaultAdminFilter) {
  let regionalPartnerFilter = JSON.parse(sessionStorage.getItem("regionalPartnerFilter"));

  if (!regionalPartnerFilter) {
    if (isWorkshopAdmin) {
      regionalPartnerFilter = defaultAdminFilter || UNMATCHED_PARTNER_OPTION;
    } else if (regionalPartners.length === 1) {
      regionalPartnerFilter = {label: regionalPartners[0].name, value: regionalPartners[0].id};
    } else {
      regionalPartnerFilter = ALL_PARTNERS_OPTION;
    }
  }

  return regionalPartnerFilter;
}

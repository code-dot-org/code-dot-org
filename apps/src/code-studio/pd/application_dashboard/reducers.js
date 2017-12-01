import {AllPartnersLabel} from './constants';

const SET_REGIONAL_PARTNER_NAME = 'application_dashboard/SET_REGIONAL_PARTNER_NAME';

const initialState = {
  regionalPartnerName: AllPartnersLabel
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_REGIONAL_PARTNER_NAME:
      return {
        ...state,
        regionalPartnerName: action.name
      };

    default:
      return state;
  }
}

export const setRegionalPartnerName = (name) => ({
  type: SET_REGIONAL_PARTNER_NAME,
  name
});

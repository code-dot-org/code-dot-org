const SET_MAPBOX_ACCESS_TOKEN = 'mapbox/SET_MAPBOX_ACCESS_TOKEN';

const initialState = {
  mapboxAccessToken: null
};

export default function reducer(state = initialState, action) {
  if (action.type === SET_MAPBOX_ACCESS_TOKEN) {
    return {...state, mapboxAccessToken: action.mapboxAccessToken};
  }
  return state;
}

export function setMapboxAccessToken(mapboxAccessToken) {
  return {type: SET_MAPBOX_ACCESS_TOKEN, mapboxAccessToken};
}

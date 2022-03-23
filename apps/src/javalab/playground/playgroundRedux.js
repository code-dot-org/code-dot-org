const ADD_ITEM_DATA = 'playground/ADD_ITEM_DATA';
const REMOVE_ITEM_DATA = 'playground/REMOVE_ITEM_DATA';
const CHANGE_ITEM_DATA = 'playground/CHANGE_IMAGE_DATA';
const SET_ITEM_DATA = 'playground/SET_IMAGE_DATA';

const initialState = {
  itemData: {}
};

// Action Creators
export const addItemData = (itemId, itemData) => {
  return {
    type: ADD_ITEM_DATA,
    itemId: itemId,
    itemData: itemData
  };
};

export const removeItemData = itemId => {
  return {
    type: REMOVE_ITEM_DATA,
    itemId: itemId
  };
};

export const changeItemData = (itemId, changeItemData) => {
  return {
    type: CHANGE_ITEM_DATA,
    itemId: itemId,
    itemData: changeItemData
  };
};

export const setItemData = itemData => {
  return {
    type: SET_ITEM_DATA,
    itemData: itemData
  };
};

// Selector
export const getItemIds = state => {
  return Object.keys(state.itemData);
};

// Reducer
export default function reducer(state = initialState, action) {
  if (action.type === ADD_ITEM_DATA) {
    const newPlaygroundItemData = {...state.itemData};
    newPlaygroundItemData[action.itemId] = action.itemData;
    return {
      ...state,
      itemData: newPlaygroundItemData
    };
  }
  if (action.type === REMOVE_ITEM_DATA) {
    const newPlaygroundItemData = {...state.itemData};
    delete newPlaygroundItemData[action.itemId];
    return {
      ...state,
      itemData: newPlaygroundItemData
    };
  }
  if (action.type === CHANGE_ITEM_DATA) {
    const newPlaygroundItemData = {...state.itemData};
    newPlaygroundItemData[action.itemId] = {
      ...state.itemData[action.itemId],
      ...action.itemData
    };
    return {
      ...state,
      itemData: newPlaygroundItemData
    };
  }
  if (action.type === SET_ITEM_DATA) {
    return {
      ...state,
      itemData: action.itemData
    };
  }
  return state;
}

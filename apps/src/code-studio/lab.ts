// Provides an entry point that the header partial uses to initialize
// the lab redux store.

import {setCurrentLevelId} from '../labs/labRedux';

const getStore = require('../redux').getStore;

const lab = {
  init: function (currentLevelId: string) {
    const store = getStore();
    store.dispatch(setCurrentLevelId(currentLevelId));
  },
};

export default lab;

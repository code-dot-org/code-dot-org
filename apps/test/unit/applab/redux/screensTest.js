import {expect} from '../../../util/configuredChai';

import screensReducer, {
  toggleImportScreen,
  changeScreen
} from '@cdo/apps/applab/redux/screens';

describe("Applab Screens Reducer", function () {

  var state;
  beforeEach(() => state = undefined);

  it("should initialize to the following", function () {
    state = screensReducer(state, {});
    expect(state.isImportingScreen).to.equal(false);
    expect(state.currentScreenId).to.equal(null);
  });

  describe("the toggleImportScreen action", () => {
    it("will toggle the isImportingScreen state", () => {
      var state = screensReducer(state, toggleImportScreen(true));
      expect(state.isImportingScreen).to.equal(true);
    });
  });

  describe("the changeScreen action", () => {
    it("will set the currentScreenId state", () => {
      var state = screensReducer(state, changeScreen('new screen id'));
      expect(state.currentScreenId).to.equal('new screen id');
    });
  });
});

import {expect} from '../../../util/configuredChai';
import 'babel-polyfill';

import screensReducer, {
  toggleImportScreen,
  changeScreen,
  fetchProject
} from '@cdo/apps/applab/redux/screens';

describe("Applab Screens Reducer", function () {

  var state;
  beforeEach(() => state = screensReducer(undefined, {}));

  it("should initialize to the following", function () {
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

  describe("the fetchProject action", () => {
    describe("when given an invalid url", () => {
      it("will set the errorFetchingProject state", () => {
        state = screensReducer(state, fetchProject('invalid url'));
        expect(state.importProject.isFetchingProject).to.be.false;
        expect(state.importProject.errorFetchingProject).to.be.true;
      });
    });

    describe("when given a valid url", () => {
    });
  });

});

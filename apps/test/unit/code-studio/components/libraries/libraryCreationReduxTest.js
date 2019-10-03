/** @file Tests for library creation redux module */
import {expect} from '../../../../util/reconfiguredChai';
import reducer, * as libraries from '@cdo/apps/code-studio/components/Libraries/libraryCreationRedux';

describe('Library creation redux module', () => {
  let originalState = {
    isOpen: false,
    libraryName: '',
    librarySource: ''
  };

  it('has expected default state', () => {
    expect(reducer(undefined, {})).to.deep.equal(originalState);
  });

  it('returns default state when a nonrecognized action is applied', () => {
    expect(reducer(undefined, {type: 'fakeAction'})).to.deep.equal(
      originalState
    );
  });

  it('showLibraryCreationDialog sets isOpen to true', () => {
    expect(
      reducer(undefined, libraries.showLibraryCreationDialog())
    ).to.deep.equal({...originalState, ...{isOpen: true}});
  });

  it('hideLibraryCreationDialog sets isOpen to false', () => {
    expect(
      reducer({...{isOpen: true}}, libraries.hideLibraryCreationDialog())
    ).to.deep.equal(originalState);
  });

  it('setLibrarySource sets the librarySource', () => {
    let librarySource = 'librarySource';
    expect(
      reducer(undefined, libraries.setLibrarySource(librarySource))
    ).to.deep.equal({...originalState, ...{librarySource: librarySource}});
  });

  it('setLibraryName sets the libraryName', () => {
    let libraryName = 'libraryName';
    expect(
      reducer(undefined, libraries.setLibraryName(libraryName))
    ).to.deep.equal({...originalState, ...{libraryName: libraryName}});
  });
});

import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {
  UnconnectedLibraryCreationDialog as LibraryCreationDialog,
  DialogState,
  LoadingDisplay,
  ErrorDisplay,
  SuccessDisplay
} from '@cdo/apps/code-studio/components/libraries/LibraryCreationDialog.jsx';
import LibraryPublisher from '@cdo/apps/code-studio/components/libraries/LibraryPublisher.jsx';

describe('LibraryCreationDialog', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <LibraryCreationDialog
        libraryClientApi={{}}
        dialogIsOpen={true}
        onClose={() => {}}
      />
    );
  });

  afterEach(() => {
    wrapper = null;
  });

  describe('UI', () => {
    it('displays loading while in the loading state', () => {
      expect(wrapper.find(LoadingDisplay).exists()).to.be.true;
    });

    it('displays success while in the published state', () => {
      wrapper.setState({dialogState: DialogState.PUBLISHED});
      expect(wrapper.find(SuccessDisplay).exists()).to.be.true;
    });

    it('displays error while in the code error state', () => {
      wrapper.setState({dialogState: DialogState.CODE_ERROR});
      expect(wrapper.find(ErrorDisplay).exists()).to.be.true;
    });

    it('displays error while in the no functions state', () => {
      wrapper.setState({dialogState: DialogState.NO_FUNCTIONS});
      expect(wrapper.find(ErrorDisplay).exists()).to.be.true;
    });

    it('displays publisher dialog while in the done loading state', () => {
      wrapper.setState({dialogState: DialogState.DONE_LOADING});
      expect(wrapper.find(LibraryPublisher).exists()).to.be.true;
    });
  });
});

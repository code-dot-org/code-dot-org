import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {
  UnconnectedLibraryCreationDialog as LibraryCreationDialog,
  DialogState,
  LoadingDisplay,
  UnpublishSuccessDisplay,
  ErrorDisplay
} from '@cdo/apps/code-studio/components/libraries/LibraryCreationDialog.jsx';
import PublishSuccessDisplay from '@cdo/apps/code-studio/components/libraries/PublishSuccessDisplay.jsx';
import LibraryPublisher from '@cdo/apps/code-studio/components/libraries/LibraryPublisher.jsx';

describe('LibraryCreationDialog', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <LibraryCreationDialog
        channelId="123"
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
      expect(wrapper.find(PublishSuccessDisplay).exists()).to.be.true;
    });

    it('displays unpublish success while in the unpublished state', () => {
      wrapper.setState({dialogState: DialogState.UNPUBLISHED});
      expect(wrapper.find(UnpublishSuccessDisplay).exists()).to.be.true;
    });

    it('displays error while in the error state', () => {
      wrapper.setState({dialogState: DialogState.ERROR});
      expect(wrapper.find(ErrorDisplay).exists()).to.be.true;
    });

    it('displays error when no state is set', () => {
      wrapper.setState({dialogState: undefined});
      expect(wrapper.find(ErrorDisplay).exists()).to.be.true;
    });

    it('displays publisher dialog while in the done loading state', () => {
      wrapper.setState({dialogState: DialogState.DONE_LOADING});
      expect(wrapper.find(LibraryPublisher).exists()).to.be.true;
    });
  });
});

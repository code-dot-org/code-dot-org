import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';
import {
  UnconnectedLibraryCreationDialog as LibraryCreationDialog,
  DialogState
} from '@cdo/apps/code-studio/components/libraries/LibraryCreationDialog.jsx';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

describe('LibraryCreationDialog', () => {
  let wrapper;
  const CHANNEL_ID_SELECTOR = 'input[type="text"]';

  beforeEach(() => {
    wrapper = shallow(
      <LibraryCreationDialog
        clientApi={{}}
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
      expect(wrapper.find(Spinner).exists()).to.be.true;
    });

    it('displays channel id when in published state', () => {
      replaceOnWindow('dashboard', {
        project: {
          getCurrentId: () => {}
        }
      });
      sinon.stub(window.dashboard.project, 'getCurrentId').returns('123');
      wrapper.setState({
        libraryName: 'name',
        dialogState: DialogState.PUBLISHED
      });

      expect(wrapper.find(CHANNEL_ID_SELECTOR).props().value).to.equal('123');

      restoreOnWindow('dashboard');
    });
  });
});

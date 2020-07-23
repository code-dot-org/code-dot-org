import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
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
  describe('UI', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(
        <LibraryCreationDialog
          channelId="123"
          dialogIsOpen
          onClose={() => {}}
        />
      );
    });

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

    it('displays error while in code_profanity state', () => {
      wrapper.setState({dialogState: DialogState.CODE_PROFANITY});
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

  describe('onLibraryLoaded', () => {
    let server;

    beforeEach(() => {
      server = sinon.fakeServer.create();
      server.autoRespond = true;
    });

    afterEach(() => {
      server.restore();
    });

    const stubFindProfanityRequest = (status, serverData) => {
      server.respondWith('POST', `/profanity/find`, [
        status,
        {'Content-Type': 'application/json'},
        JSON.stringify(serverData)
      ]);
    };

    it('displays an error if profanity is found in library code', async () => {
      stubFindProfanityRequest(200, ['fart']);
      const library = {
        librarySource: 'function fart() {};'
      };
      const wrapper = shallow(
        <LibraryCreationDialog
          channelId="123"
          dialogIsOpen
          onClose={() => {}}
        />
      );

      await wrapper.instance().onLibraryLoaded(library);

      expect(wrapper.find(ErrorDisplay).exists()).to.be.true;
      expect(wrapper.state('dialogState')).to.equal(DialogState.CODE_PROFANITY);
      expect(wrapper.state('errorMessage')).to.equal(
        'It appears that your project contains inappropriate language. Please update your project to remove the word "fart".'
      );
    });

    it('displays the LibraryPublisher if no profanity is found in library code', async () => {
      stubFindProfanityRequest(200, null);
      const wrapper = shallow(
        <LibraryCreationDialog
          channelId="123"
          dialogIsOpen
          onClose={() => {}}
        />
      );

      await wrapper.instance().onLibraryLoaded({});

      expect(wrapper.find('LibraryPublisher').exists()).to.be.true;
      expect(wrapper.state('dialogState')).to.equal(DialogState.DONE_LOADING);
      expect(wrapper.state('errorMessage')).to.equal('');
    });

    it('displays the LibraryPublisher if the request to find profanity errors', async () => {
      stubFindProfanityRequest(500, null);
      const wrapper = shallow(
        <LibraryCreationDialog
          channelId="123"
          dialogIsOpen
          onClose={() => {}}
        />
      );

      await wrapper.instance().onLibraryLoaded({});

      expect(wrapper.find('LibraryPublisher').exists()).to.be.true;
      expect(wrapper.state('dialogState')).to.equal(DialogState.DONE_LOADING);
      expect(wrapper.state('errorMessage')).to.equal('');
    });
  });
});

import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import ModelManagerDialog from '@cdo/apps/code-studio/components/ModelManagerDialog';
import commonI18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('ModelManagerDialog', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('localization', () => {
    it('is used when there are no models', () => {
      sinon.stub(commonI18n, 'aiTrainedModels').returns('i18n-header');
      sinon.stub(commonI18n, 'aiTrainedModelsNoModels').returns('i18n-nomodel');

      const wrapper = shallow(
        <ModelManagerDialog
          isOpen={true}
          onClose={() => {}}
          autogenerateML={() => {}}
          levelbuilderModel={null}
        />
      );

      // Ensure there are no models.
      wrapper.setState({
        isModelListPending: false,
        models: [],
      });

      // Get the main modal.
      let modal = wrapper.find('BaseDialog').first();

      let message = modal.find('select + div').first();

      expect(modal.find('h1').text()).to.contain('i18n-header');
      expect(message.text()).to.contain('i18n-nomodel');
    });

    it('is used when there are models', () => {
      let i18n = {
        aiTrainedModels: 'i18n-header',
        import: 'i18n-import',
        importingWithEllipsis: 'i18n-importing',
        delete: 'i18n-delete',
      };

      for (const key in i18n) {
        sinon.stub(commonI18n, key).returns(i18n[key]);
      }

      const wrapper = shallow(
        <ModelManagerDialog
          isOpen={true}
          onClose={() => {}}
          autogenerateML={() => {}}
          levelbuilderModel={{id: '1', name: 'Model 2'}}
        />
      );

      // Ensure there are some models.
      wrapper.setState({
        isModelListPending: false,
        selectedModel: {
          id: '0',
          name: 'Model 1',
        },
        models: [
          {
            id: '0',
            name: 'Model 1',
          },
          {
            id: '1',
            name: 'Model 2',
          },
        ],
      });

      // Get the main modal.
      let modal = wrapper.find('BaseDialog').first();

      let importButton = modal.find('Button').first();
      let deleteButton = modal.find('Button').at(1);

      expect(modal.find('h1').text()).to.contain('i18n-header');
      expect(modal.find('select + div').exists()).to.equal(false);
      expect(importButton.prop('text')).to.contain('i18n-import');
      expect(importButton.prop('pendingText')).to.contain('i18n-importing');
      expect(deleteButton.prop('text')).to.contain('i18n-delete');
    });

    it('is used within the delete confirmation modal', () => {
      let i18n = {
        aiTrainedModelsDeleteModelConfirm: 'i18n-delete-confirm',
        aiTrainedModelsDeleteModelMessage: 'i18n-delete-message',
        no: 'i18n-no',
        delete: 'i18n-delete',
        deletingWithEllipsis: 'i18n-deleting',
      };

      for (const key in i18n) {
        sinon.stub(commonI18n, key).returns(i18n[key]);
      }

      const wrapper = shallow(
        <ModelManagerDialog
          isOpen={true}
          onClose={() => {}}
          autogenerateML={() => {}}
          levelbuilderModel={null}
        />
      );

      // Get the delete confirm modal.
      let modal = wrapper.find('BaseDialog').at(1);

      // Find the confirm modal header.
      let noButton = modal.find('Button').first();
      let deleteButton = modal.find('Button').at(1);
      let message = modal.find('p').first();

      expect(modal.find('h1').text()).to.contain('i18n-delete-confirm');
      expect(message.text()).to.contain('i18n-delete-message');
      expect(noButton.prop('text')).to.contain('i18n-no');
      expect(deleteButton.prop('text')).to.contain('i18n-delete');
      expect(deleteButton.prop('pendingText')).to.contain('i18n-deleting');
    });

    it('is used within the delete confirmation modal to display the delete model failure message', () => {
      let i18n = {
        aiTrainedModelsDeleteModelFailed: 'i18n-delete-fail',
      };

      for (const key in i18n) {
        sinon.stub(commonI18n, key).returns(i18n[key]);
      }

      // Stub the request for deletion.
      let xhr = sinon.useFakeXMLHttpRequest();
      let lastRequest = null;
      xhr.onCreate = req => {
        lastRequest = req;
      };

      const wrapper = shallow(
        <ModelManagerDialog
          isOpen={true}
          onClose={() => {}}
          autogenerateML={() => {}}
          levelbuilderModel={{id: '1', name: 'Model 2'}}
        />
      );

      wrapper.setState({
        isModelListPending: false,
        selectedModel: {
          id: '0',
          name: 'Model 1',
        },
        models: [
          {
            id: '0',
            name: 'Model 1',
          },
          {
            id: '1',
            name: 'Model 2',
          },
        ],
      });

      // Get the delete confirm modal.
      let modal = wrapper.find('BaseDialog').at(1);

      // Click on Delete button to check that the failure message is localized.
      let deleteButton = modal.find('Button').at(1);
      deleteButton.prop('onClick')();

      // Ensure that the request responds with a failure.
      let headers = {'Content-Type': 'application/json'};
      let response = JSON.stringify({
        id: '0',
        status: 'failure',
      });

      lastRequest.respond(200, headers, response);
      wrapper.setState({});

      // Get the updated delete confirm modal.
      modal = wrapper.find('BaseDialog').at(1);

      // Ensure it is passed the id for the localization.
      expect(
        commonI18n.aiTrainedModelsDeleteModelFailed
      ).to.have.been.calledWith(sinon.match.has('id', '0'));

      // Find and compare the status string.
      let deleteMessage = modal.find('p').at(1);
      expect(deleteMessage.text()).to.contain('i18n-delete-fail');
    });
  });
});

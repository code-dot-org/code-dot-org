import Alert from '@code-dot-org/component-library/alert';
import Modal from '@code-dot-org/component-library/modal';
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

      const modal = wrapper.find(Modal).first();
      const customContent = shallow(modal.prop('customContent'));

      expect(modal.prop('title')).to.contain('i18n-header');
      expect(customContent.text()).to.contain('i18n-nomodel');
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

      const modal = wrapper.find(Modal).first();
      const customContent = shallow(modal.prop('customContent'));

      expect(modal.prop('title')).to.contain('i18n-header');
      expect(customContent.text()).to.not.contain('i18n-nomodel');
      expect(modal.prop('primaryButtonProps').children).to.contain(
        'i18n-import'
      );
      expect(modal.prop('secondaryButtonProps').children).to.contain(
        'i18n-delete'
      );

      // Pending import swaps the primary button label to the importing text.
      wrapper.setState({isImportPending: true});
      const pendingModal = wrapper.find(Modal).first();
      expect(pendingModal.prop('primaryButtonProps').children).to.contain(
        'i18n-importing'
      );
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

      wrapper.setState({confirmDialogOpen: true});

      const dialog = wrapper.find(Modal).at(1);

      expect(dialog.prop('title')).to.contain('i18n-delete-confirm');
      expect(dialog.prop('description')).to.contain('i18n-delete-message');
      expect(dialog.prop('secondaryButtonProps').children).to.contain(
        'i18n-no'
      );
      expect(dialog.prop('primaryButtonProps').children).to.contain(
        'i18n-delete'
      );

      // Pending delete swaps the primary button label to the deleting text.
      wrapper.setState({isDeletePending: true});
      const pendingDialog = wrapper.find(Modal).at(1);
      expect(pendingDialog.prop('primaryButtonProps').children).to.contain(
        'i18n-deleting'
      );
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
        confirmDialogOpen: true,
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

      // Trigger the delete via the primary button.
      const dialog = wrapper.find(Modal).at(1);
      dialog.prop('primaryButtonProps').onClick();

      let headers = {'Content-Type': 'application/json'};
      let response = JSON.stringify({
        id: '0',
        status: 'failure',
      });

      lastRequest.respond(200, headers, response);
      wrapper.setState({});

      // Ensure the id was passed to the localization key.
      expect(
        commonI18n.aiTrainedModelsDeleteModelFailed
      ).to.have.been.calledWith(sinon.match.has('id', '0'));

      // The failure message renders inside the dialog's customContent as an Alert.
      const updatedDialog = wrapper.find(Modal).at(1);
      const alert = shallow(updatedDialog.prop('customContent')).find(Alert);
      expect(alert.prop('text')).to.contain('i18n-delete-fail');
      expect(alert.prop('type')).to.equal('danger');
    });
  });
});

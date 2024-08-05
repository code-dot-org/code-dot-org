import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import DeleteAccount, {
  DELETE_VERIFICATION_STRING,
} from '@cdo/apps/lib/ui/accounts/DeleteAccount';
import {getCheckboxes} from '@cdo/apps/lib/ui/accounts/DeleteAccountHelpers';
import * as utils from '@cdo/apps/utils';

import {expect} from '../../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

const DEFAULT_PROPS = {
  isPasswordRequired: true,
  isTeacher: false,
  hasStudents: false,
  dependentStudentsCount: 3,
  isAdmin: false,
};

describe('DeleteAccount', () => {
  describe('DeleteAccountDialog submission', () => {
    it('is disabled if password is required and not provided', () => {
      const wrapper = mount(<DeleteAccount {...DEFAULT_PROPS} />);
      React.act(() => {
        wrapper.setState({
          isDeleteAccountDialogOpen: true,
          deleteVerification: DELETE_VERIFICATION_STRING,
        });
      });
      const confirmButton = wrapper.find('Button').at(1);
      expect(confirmButton).to.have.attr('disabled');
    });

    it('is disabled if verification string is not provided', () => {
      const wrapper = mount(<DeleteAccount {...DEFAULT_PROPS} />);
      React.act(() => {
        wrapper.setState({
          isDeleteAccountDialogOpen: true,
          password: 'password',
        });
      });
      const confirmButton = wrapper.find('Button').at(1);
      expect(confirmButton).to.have.attr('disabled');
    });

    it('is disabled if verification string is incorrect', () => {
      const wrapper = mount(<DeleteAccount {...DEFAULT_PROPS} />);
      React.act(() => {
        wrapper.setState({
          isDeleteAccountDialogOpen: true,
          password: 'password',
          deleteVerification: 'some other string',
        });
      });
      const confirmButton = wrapper.find('Button').at(1);
      expect(confirmButton).to.have.attr('disabled');
    });

    describe('for students', () => {
      it('is enabled if password is not required and verification string is correct', () => {
        const wrapper = mount(
          <DeleteAccount {...DEFAULT_PROPS} isPasswordRequired={false} />
        );
        React.act(() => {
          wrapper.setState({
            isDeleteAccountDialogOpen: true,
            deleteVerification: DELETE_VERIFICATION_STRING,
          });
        });
        const confirmButton = wrapper.find('Button').at(1);
        expect(confirmButton).to.not.have.attr('disabled');
      });

      it('is enabled if password is provided and verification string is correct', () => {
        const wrapper = mount(<DeleteAccount {...DEFAULT_PROPS} />);
        React.act(() => {
          wrapper.setState({
            isDeleteAccountDialogOpen: true,
            password: 'password',
            deleteVerification: DELETE_VERIFICATION_STRING,
          });
        });
        const confirmButton = wrapper.find('Button').at(1);
        expect(confirmButton).to.not.have.attr('disabled');
      });
    });

    describe('for teachers', () => {
      it('displays PersonalLoginDialog with dependent student count if depended upon for login', () => {
        const wrapper = mount(
          <DeleteAccount
            {...DEFAULT_PROPS}
            isTeacher={true}
            hasStudents={true}
          />
        );
        const deleteAccountButton = wrapper.find('BootstrapButton').at(0);
        deleteAccountButton.simulate('click');
        const personalLoginDialog = wrapper.find('PersonalLoginDialog');
        expect(personalLoginDialog).to.exist;
      });

      it('is disabled if not all checkboxes are checked', () => {
        const wrapper = mount(
          <DeleteAccount
            {...DEFAULT_PROPS}
            isTeacher={true}
            hasStudents={true}
          />
        );
        let checkboxes = getCheckboxes(true, true);
        checkboxes[1].checked = true;
        React.act(() => {
          wrapper.setState({
            isDeleteAccountDialogOpen: true,
            password: 'password',
            deleteVerification: DELETE_VERIFICATION_STRING,
            checkboxes,
          });
        });
        const confirmButton = wrapper.find('Button').at(1);
        expect(confirmButton).to.have.attr('disabled');
      });

      it('is enabled if checkboxes are checked, verification string is correct, and password not required', () => {
        const wrapper = mount(
          <DeleteAccount
            {...DEFAULT_PROPS}
            isPasswordRequired={false}
            isTeacher={true}
            hasStudents={true}
          />
        );
        let checkboxes = getCheckboxes(false, true);
        Object.keys(checkboxes).map(id => (checkboxes[id].checked = true));
        React.act(() => {
          wrapper.setState({
            isDeleteAccountDialogOpen: true,
            deleteVerification: DELETE_VERIFICATION_STRING,
            checkboxes,
          });
        });
        const confirmButton = wrapper.find('Button').at(1);
        expect(confirmButton).to.not.have.attr('disabled');
      });

      it('is enabled if checkboxes are checked, verification string is correct, and password provided and required', () => {
        const wrapper = mount(
          <DeleteAccount
            {...DEFAULT_PROPS}
            isTeacher={true}
            hasStudents={true}
          />
        );
        let checkboxes = getCheckboxes(true, true);
        Object.keys(checkboxes).map(id => (checkboxes[id].checked = true));
        React.act(() => {
          wrapper.setState({
            isDeleteAccountDialogOpen: true,
            password: 'password',
            deleteVerification: DELETE_VERIFICATION_STRING,
            checkboxes,
          });
        });
        const confirmButton = wrapper.find('Button').at(1);
        expect(confirmButton).to.not.have.attr('disabled');
      });

      it('is enabled if there are no checkboxes, verification string is correct, and password provided and required', () => {
        const wrapper = mount(
          <DeleteAccount
            {...DEFAULT_PROPS}
            isTeacher={true}
            hasStudents={false}
          />
        );
        React.act(() => {
          wrapper.setState({
            isDeleteAccountDialogOpen: true,
            password: 'password',
            deleteVerification: DELETE_VERIFICATION_STRING,
          });
        });
        const confirmButton = wrapper.find('Button').at(1);
        expect(confirmButton).to.not.have.attr('disabled');
      });
    });
  });

  describe('deleteUser', () => {
    let server, wrapper, confirmButton;

    beforeEach(() => {
      wrapper = mount(<DeleteAccount {...DEFAULT_PROPS} />);
      React.act(() => {
        wrapper.setState({
          isDeleteAccountDialogOpen: true,
          password: 'password',
          deleteVerification: DELETE_VERIFICATION_STRING,
        });
      });
      confirmButton = wrapper.find('Button').at(1);
      server = sinon.fakeServer.create();
    });

    afterEach(() => server.restore());

    describe('on success', () => {
      beforeEach(() => {
        sinon.stub(utils, 'navigateToHref');
        server.respondWith('DELETE', `/users`, [
          204,
          {'Content-Type': 'application/json'},
          '',
        ]);
      });

      it('navigates to root', () => {
        confirmButton.simulate('click');
        server.respond();
        expect(utils.navigateToHref).to.have.been.calledOnce.and.calledWith(
          '/'
        );
        utils.navigateToHref.restore();
      });
    });

    describe('on failure', () => {
      it('renders a password error if server returns one', () => {
        server.respondWith('DELETE', `/users`, [
          400,
          {'Content-Type': 'application/json'},
          '{"error": {"current_password": ["Incorrect password!"]}}',
        ]);
        React.act(() => {
          confirmButton.simulate('click');
          server.respond();
        });
        wrapper.update();
        expect(wrapper.find('FieldError')).to.have.text('Incorrect password!');
      });

      it('renders a generic error if server does not return a validation error', () => {
        server.respondWith('DELETE', `/users`, [
          400,
          {'Content-Type': 'application/json'},
          '',
        ]);
        React.act(() => {
          confirmButton.simulate('click');
          server.respond();
        });
        expect(wrapper.find('#uitest-delete-error')).to.have.text(
          'Unexpected error: 400'
        );
      });
    });

    describe('for admin', () => {
      it('displays AdminAccountDialog if trying to delete admin account', () => {
        const wrapper = mount(
          <DeleteAccount {...DEFAULT_PROPS} isAdmin={true} />
        );
        const deleteAccountButton = wrapper.find('BootstrapButton').at(0);
        deleteAccountButton.simulate('click');
        const adminAccountDialog = wrapper.find('AdminAccountDialog');
        expect(adminAccountDialog).to.exist;
        const confirmButton = wrapper.find('Button').at(0);
        confirmButton.simulate('click');
        const deleteAccountDialog = wrapper.find('DeleteAccountDialog');
        expect(deleteAccountDialog).to.exist;
      });
    });
  });
});

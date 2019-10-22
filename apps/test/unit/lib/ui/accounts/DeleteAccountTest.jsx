import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/deprecatedChai';
import DeleteAccount, {
  DELETE_VERIFICATION_STRING
} from '@cdo/apps/lib/ui/accounts/DeleteAccount';
import {getCheckboxes} from '@cdo/apps/lib/ui/accounts/DeleteAccountHelpers';
import * as utils from '@cdo/apps/utils';

const DEFAULT_PROPS = {
  isPasswordRequired: true,
  isTeacher: false,
  hasStudents: false,
  dependentStudents: []
};

describe('DeleteAccount', () => {
  describe('DeleteAccountDialog submission', () => {
    it('is disabled if password is required and not provided', () => {
      const wrapper = mount(<DeleteAccount {...DEFAULT_PROPS} />);
      wrapper.setState({
        isDeleteAccountDialogOpen: true,
        deleteVerification: DELETE_VERIFICATION_STRING
      });
      const confirmButton = wrapper.find('Button').at(0);
      expect(confirmButton).to.have.attr('disabled');
    });

    it('is disabled if verification string is not provided', () => {
      const wrapper = mount(<DeleteAccount {...DEFAULT_PROPS} />);
      wrapper.setState({
        isDeleteAccountDialogOpen: true,
        password: 'password'
      });
      const confirmButton = wrapper.find('Button').at(0);
      expect(confirmButton).to.have.attr('disabled');
    });

    it('is disabled if verification string is incorrect', () => {
      const wrapper = mount(<DeleteAccount {...DEFAULT_PROPS} />);
      wrapper.setState({
        isDeleteAccountDialogOpen: true,
        password: 'password',
        deleteVerification: 'some other string'
      });
      const confirmButton = wrapper.find('Button').at(0);
      expect(confirmButton).to.have.attr('disabled');
    });

    describe('for students', () => {
      it('is enabled if password is not required and verification string is correct', () => {
        const wrapper = mount(
          <DeleteAccount {...DEFAULT_PROPS} isPasswordRequired={false} />
        );
        wrapper.setState({
          isDeleteAccountDialogOpen: true,
          deleteVerification: DELETE_VERIFICATION_STRING
        });
        const confirmButton = wrapper.find('Button').at(0);
        expect(confirmButton).to.not.have.attr('disabled');
      });

      it('is enabled if password is provided and verification string is correct', () => {
        const wrapper = mount(<DeleteAccount {...DEFAULT_PROPS} />);
        wrapper.setState({
          isDeleteAccountDialogOpen: true,
          password: 'password',
          deleteVerification: DELETE_VERIFICATION_STRING
        });
        const confirmButton = wrapper.find('Button').at(0);
        expect(confirmButton).to.not.have.attr('disabled');
      });
    });

    describe('for teachers', () => {
      it('displays PersonalLoginDialog with dependent student info if depended upon for login', () => {
        const dependentStudents = [
          {id: 1, name: 'Student B', username: 'student_b'},
          {id: 3, name: 'Student A', username: 'student_a'},
          {id: 2, name: 'Student C', username: 'student_c'}
        ];
        const wrapper = mount(
          <DeleteAccount
            {...DEFAULT_PROPS}
            isTeacher={true}
            hasStudents={true}
            dependentStudents={dependentStudents}
          />
        );
        const deleteAccountButton = wrapper.find('BootstrapButton').at(0);
        deleteAccountButton.simulate('click');
        const personalLoginDialog = wrapper.find('PersonalLoginDialog');
        expect(personalLoginDialog).to.exist;
        const studentElements = personalLoginDialog.find(
          '.uitest-dependent-student'
        );
        expect(studentElements).to.have.length(3);
        // Make sure students are sorted alphabetically by name
        expect(studentElements.at(0)).to.contain.text('Student A');
        expect(studentElements.at(1)).to.contain.text('Student B');
        expect(studentElements.at(2)).to.contain.text('Student C');
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
        wrapper.setState({
          isDeleteAccountDialogOpen: true,
          password: 'password',
          deleteVerification: DELETE_VERIFICATION_STRING,
          checkboxes
        });
        const confirmButton = wrapper.find('Button').at(0);
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
        wrapper.setState({
          isDeleteAccountDialogOpen: true,
          deleteVerification: DELETE_VERIFICATION_STRING,
          checkboxes
        });
        const confirmButton = wrapper.find('Button').at(0);
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
        wrapper.setState({
          isDeleteAccountDialogOpen: true,
          password: 'password',
          deleteVerification: DELETE_VERIFICATION_STRING,
          checkboxes
        });
        const confirmButton = wrapper.find('Button').at(0);
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
        wrapper.setState({
          isDeleteAccountDialogOpen: true,
          password: 'password',
          deleteVerification: DELETE_VERIFICATION_STRING
        });
        const confirmButton = wrapper.find('Button').at(0);
        expect(confirmButton).to.not.have.attr('disabled');
      });
    });
  });

  describe('deleteUser', () => {
    let server, wrapper, confirmButton;

    beforeEach(() => {
      wrapper = mount(<DeleteAccount {...DEFAULT_PROPS} />);
      wrapper.setState({
        isDeleteAccountDialogOpen: true,
        password: 'password',
        deleteVerification: DELETE_VERIFICATION_STRING
      });
      confirmButton = wrapper.find('Button').at(0);
      server = sinon.fakeServer.create();
    });

    afterEach(() => server.restore());

    describe('on success', () => {
      beforeEach(() => {
        sinon.stub(utils, 'navigateToHref');
        server.respondWith('DELETE', `/users`, [
          204,
          {'Content-Type': 'application/json'},
          ''
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
          '{"error": {"current_password": ["Incorrect password!"]}}'
        ]);
        confirmButton.simulate('click');
        server.respond();
        wrapper.update();
        expect(wrapper.find('FieldError')).to.have.text('Incorrect password!');
      });

      it('renders a generic error if server does not return a validation error', () => {
        server.respondWith('DELETE', `/users`, [
          400,
          {'Content-Type': 'application/json'},
          ''
        ]);
        confirmButton.simulate('click');
        server.respond();
        expect(wrapper.find('#uitest-delete-error')).to.have.text(
          'Unexpected error: 400'
        );
      });
    });
  });
});

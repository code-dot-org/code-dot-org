import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/configuredChai';
import DeleteAccount, {DELETE_VERIFICATION_STRING} from '@cdo/apps/lib/ui/accounts/DeleteAccount';
import * as utils from '@cdo/apps/utils';

const DEFAULT_PROPS = {
  isPasswordRequired: true,
};

describe('DeleteAccount', () => {
  describe('DeleteAccountDialog submission', () => {
    it('is disabled if password is required and not provided', () => {
      const wrapper = mount(<DeleteAccount {...DEFAULT_PROPS}/>);
      wrapper.setState({
        isDialogOpen: true,
        deleteVerification: DELETE_VERIFICATION_STRING,
      });
      const confirmButton = wrapper.find('Button').at(0);
      expect(confirmButton).to.have.attr('disabled');
    });

    it('is disabled if verification string is not provided', () => {
      const wrapper = mount(<DeleteAccount {...DEFAULT_PROPS}/>);
      wrapper.setState({
        isDialogOpen: true,
        password: 'password',
      });
      const confirmButton = wrapper.find('Button').at(0);
      expect(confirmButton).to.have.attr('disabled');
    });

    it('is disabled if verification string is incorrect', () => {
      const wrapper = mount(<DeleteAccount {...DEFAULT_PROPS}/>);
      wrapper.setState({
        isDialogOpen: true,
        password: 'password',
        deleteVerification: 'some other string',
      });
      const confirmButton = wrapper.find('Button').at(0);
      expect(confirmButton).to.have.attr('disabled');
    });

    it('is enabled if password is not required and verification string is correct', () => {
      const wrapper = mount(<DeleteAccount isPasswordRequired={false}/>);
      wrapper.setState({
        isDialogOpen: true,
        deleteVerification: DELETE_VERIFICATION_STRING,
      });
      const confirmButton = wrapper.find('Button').at(0);
      expect(confirmButton).to.not.have.attr('disabled');
    });

    it('is enabled if password is provided and verification string is correct', () => {
      const wrapper = mount(<DeleteAccount {...DEFAULT_PROPS}/>);
      wrapper.setState({
        isDialogOpen: true,
        password: 'password',
        deleteVerification: DELETE_VERIFICATION_STRING,
      });
      const confirmButton = wrapper.find('Button').at(0);
      expect(confirmButton).to.not.have.attr('disabled');
    });
  });

  describe('deleteUser', () => {
    let server, wrapper, confirmButton;

    beforeEach(() => {
      wrapper = mount(<DeleteAccount {...DEFAULT_PROPS}/>);
      wrapper.setState({
        isDialogOpen: true,
        password: 'password',
        deleteVerification: DELETE_VERIFICATION_STRING,
      });
      confirmButton = wrapper.find('Button').at(0);
      server = sinon.fakeServer.create();
    });

    afterEach(() => server.restore());

    describe('on success', () => {
      beforeEach(() => {
        sinon.stub(utils, 'navigateToHref');
        server.respondWith(
          'DELETE',
          `/users`,
          [204, {"Content-Type": "application/json"}, ""]
        );
      });

      it('navigates to root', () => {
        confirmButton.simulate('click');
        server.respond();
        expect(utils.navigateToHref).to.have.been.calledOnce.and.calledWith('/');
        utils.navigateToHref.restore();
      });
    });

    describe('on failure', () => {
      it('renders a password error if server returns one', () => {
        server.respondWith(
          'DELETE',
          `/users`,
          [400, {"Content-Type": "application/json"}, '{"error": {"current_password": ["Incorrect password!"]}}']
        );
        confirmButton.simulate('click');
        server.respond();
        expect(wrapper.find('FieldError')).to.have.text('Incorrect password!');
      });

      it('renders a generic error if server does not return a validation error', () => {
        server.respondWith(
          'DELETE',
          `/users`,
          [400, {"Content-Type": "application/json"}, ""]
        );
        confirmButton.simulate('click');
        server.respond();
        expect(wrapper.find('#uitest-delete-error')).to.have.text('Unexpected error: 400');
      });
    });
  });
});

import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/configuredChai';
import {
  UnconnectedManageLinkedAccounts as ManageLinkedAccounts,
  ENCRYPTED
} from '@cdo/apps/lib/ui/accounts/ManageLinkedAccounts';
import * as utils from '@cdo/apps/utils';

const DEFAULT_PROPS = {
  userType: 'student',
  authenticationOptions: {},
  disconnect: () => {},
  userHasPassword: true,
  isGoogleClassroomStudent: false,
  isCleverStudent: false
};

describe('ManageLinkedAccounts', () => {
  it('renders a table with oauth provider rows', () => {
    const wrapper = mount(<ManageLinkedAccounts {...DEFAULT_PROPS} />);
    expect(wrapper.find('table')).to.exist;
    expect(wrapper.find('OauthConnection').at(0)).to.include.text(
      'Google Account'
    );
    expect(wrapper.find('OauthConnection').at(1)).to.include.text(
      'Microsoft Account'
    );
    expect(wrapper.find('OauthConnection').at(2)).to.include.text(
      'Clever Account'
    );
    expect(wrapper.find('OauthConnection').at(3)).to.include.text(
      'Facebook Account'
    );
  });

  it('renders an empty message for unconnected authentication options', () => {
    const wrapper = mount(<ManageLinkedAccounts {...DEFAULT_PROPS} />);
    const googleEmailCell = wrapper
      .find('OauthConnection')
      .at(0)
      .find('td')
      .at(1);
    expect(googleEmailCell).to.have.text('Not Connected');
  });

  it('renders "encrypted" for authentication options with no recorded email', () => {
    const authOptions = {
      1: {
        id: 1,
        credentialType: 'google_oauth2',
        email: ''
      }
    };
    const wrapper = mount(
      <ManageLinkedAccounts
        {...DEFAULT_PROPS}
        authenticationOptions={authOptions}
      />
    );
    const googleEmailCell = wrapper
      .find('OauthConnection')
      .at(0)
      .find('td')
      .at(1);
    expect(googleEmailCell).to.have.text(ENCRYPTED);
  });

  it('renders teacher email for authentication options', () => {
    const authOptions = {
      1: {
        id: 1,
        credentialType: 'google_oauth2',
        email: 'teacher@google.com'
      },
      2: {
        id: 2,
        credentialType: 'microsoft_v2_auth',
        email: 'teacher@microsoft.com'
      },
      4: {
        id: 4,
        credentialType: 'clever',
        email: 'teacher@clever.com'
      },
      3: {
        id: 3,
        credentialType: 'facebook',
        email: 'teacher@facebook.com'
      }
    };

    const wrapper = mount(
      <ManageLinkedAccounts
        {...DEFAULT_PROPS}
        userType="teacher"
        authenticationOptions={authOptions}
      />
    );

    const oauthConnections = wrapper.find('OauthConnection');

    const googleConnection = oauthConnections.at(0);
    expect(googleConnection.find('td').at(1)).to.have.text(
      'teacher@google.com'
    );
    expect(googleConnection.find('td').at(2)).to.have.text('Disconnect');

    const microsoftConnection = oauthConnections.at(1);
    expect(microsoftConnection.find('td').at(1)).to.have.text(
      'teacher@microsoft.com'
    );
    expect(microsoftConnection.find('td').at(2)).to.have.text('Disconnect');

    const cleverConnection = oauthConnections.at(2);
    expect(cleverConnection.find('td').at(1)).to.have.text(
      'teacher@clever.com'
    );
    expect(cleverConnection.find('td').at(2)).to.have.text('Disconnect');

    const facebookConnection = oauthConnections.at(3);
    expect(facebookConnection.find('td').at(1)).to.have.text(
      'teacher@facebook.com'
    );
    expect(facebookConnection.find('td').at(2)).to.have.text('Disconnect');
  });

  it('renders authentication option error', () => {
    const authOptions = {
      1: {
        id: 1,
        credentialType: 'google_oauth2',
        error: 'Oh no!'
      }
    };
    const wrapper = mount(
      <ManageLinkedAccounts
        {...DEFAULT_PROPS}
        authenticationOptions={authOptions}
      />
    );
    const googleEmailCell = wrapper
      .find('OauthConnection')
      .at(0)
      .find('td')
      .at(2);
    expect(googleEmailCell).to.include.text('Oh no!');
  });

  it('navigates to provider endpoint if authentication option is not connected', () => {
    sinon.stub(utils, 'navigateToHref');
    const wrapper = mount(<ManageLinkedAccounts {...DEFAULT_PROPS} />);
    wrapper
      .find('BootstrapButton')
      .at(0)
      .simulate('click');
    expect(utils.navigateToHref).to.have.been.calledOnce.and.calledWith(
      '/users/auth/google_oauth2/connect'
    );
    utils.navigateToHref.restore();
  });

  it('calls disconnect if authentication option is connected', () => {
    const authOptions = {
      1: {id: 1, credentialType: 'google_oauth2', email: 'student@email.com'},
      2: {id: 2, credentialType: 'facebook', email: 'student@email.com'}
    };
    const disconnect = sinon.stub();
    const wrapper = mount(
      <ManageLinkedAccounts
        {...DEFAULT_PROPS}
        authenticationOptions={authOptions}
        disconnect={disconnect}
      />
    );
    wrapper
      .find('BootstrapButton')
      .at(0)
      .simulate('click');
    expect(disconnect).to.have.been.calledOnce;
  });

  it('disables disconnecting from google if user is in a google classroom section', () => {
    const authOptions = {1: {id: 1, credentialType: 'google_oauth2'}};
    const wrapper = mount(
      <ManageLinkedAccounts
        {...DEFAULT_PROPS}
        authenticationOptions={authOptions}
        isGoogleClassroomStudent={true}
      />
    );
    const googleConnectButton = wrapper.find('BootstrapButton').at(0);
    expect(googleConnectButton).to.have.attr('disabled');
  });

  it('disables disconnecting from clever if user is in a clever section', () => {
    const authOptions = {1: {id: 1, credentialType: 'clever'}};
    const wrapper = mount(
      <ManageLinkedAccounts
        {...DEFAULT_PROPS}
        authenticationOptions={authOptions}
        isCleverStudent={true}
      />
    );
    const cleverConnectButton = wrapper.find('BootstrapButton').at(2);
    expect(cleverConnectButton).to.have.attr('disabled');
  });

  it("disables disconnecting from the user's last authentication option if the user does not have a password", () => {
    const authOptions = {1: {id: 1, credentialType: 'facebook'}};
    const wrapper = mount(
      <ManageLinkedAccounts
        {...DEFAULT_PROPS}
        userHasPassword={false}
        authenticationOptions={authOptions}
      />
    );
    const facebookConnectButton = wrapper.find('BootstrapButton').at(3);
    expect(facebookConnectButton).to.have.attr('disabled');
  });

  it("does not disable disconnecting from the user's last authentication option if the user has a password", () => {
    const authOptions = {1: {id: 1, credentialType: 'facebook'}};
    const wrapper = mount(
      <ManageLinkedAccounts
        {...DEFAULT_PROPS}
        userHasPassword={true}
        authenticationOptions={authOptions}
      />
    );
    const facebookConnectButton = wrapper.find('BootstrapButton').at(3);
    expect(facebookConnectButton).to.not.have.attr('disabled');
  });

  it("disables disconnecting from the user's last oauth authentication option if user doesn't have a password", () => {
    const authOptions = {
      1: {id: 1, credentialType: 'google_oauth2'},
      2: {id: 2, credentialType: 'email'},
      3: {id: 3, credentialType: 'email'}
    };
    const wrapper = mount(
      <ManageLinkedAccounts
        {...DEFAULT_PROPS}
        authenticationOptions={authOptions}
        userHasPassword={false}
      />
    );
    const googleConnectButton = wrapper.find('BootstrapButton').at(0);
    expect(googleConnectButton).to.have.attr('disabled');
  });
});

import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/deprecatedChai';
import {
  UnconnectedManageLinkedAccounts as ManageLinkedAccounts,
  ENCRYPTED
} from '@cdo/apps/lib/ui/accounts/ManageLinkedAccounts';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

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

  it('posts form data to connect endpoint if authentication option is not connected', () => {
    const wrapper = mount(<ManageLinkedAccounts {...DEFAULT_PROPS} />);
    const form = wrapper.find('form').at(0);
    expect(form.prop('method')).to.equal('POST');
    expect(form.prop('action')).to.equal(
      '/users/auth/google_oauth2?action=connect'
    );
  });

  it('posts form data to disconnect endpoint if authentication option is connected', () => {
    const authOptions = {
      1: {id: 1, credentialType: 'google_oauth2', email: 'student@email.com'},
      2: {id: 2, credentialType: 'facebook', email: 'student@email.com'}
    };
    const wrapper = mount(
      <ManageLinkedAccounts
        {...DEFAULT_PROPS}
        authenticationOptions={authOptions}
      />
    );

    const forms = wrapper.find('form');
    const expected = [
      '/users/auth/1/disconnect',
      '/users/auth/microsoft_v2_auth?action=connect',
      '/users/auth/clever?action=connect',
      '/users/auth/2/disconnect'
    ];
    forms.forEach((form, i) => {
      expect(form.prop('method')).to.equal('POST');
      expect(form.prop('action')).to.equal(expected[i]);
    });
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

  describe('in the Maker App', () => {
    beforeEach(() => {
      replaceOnWindow('MakerBridge', true);
    });

    afterEach(() => {
      restoreOnWindow('MakerBridge', false);
    });

    it('renders the Google Account as disabled with explanatory tooltip', () => {
      const wrapper = mount(<ManageLinkedAccounts {...DEFAULT_PROPS} />);

      expect(wrapper.find('table')).to.exist;
      expect(wrapper.find('OauthConnection').at(0)).to.include.text(
        'Google Account'
      );

      let googleOAuthButton = wrapper
        .find('OauthConnection')
        .at(0)
        .find('BootstrapButton');
      expect(googleOAuthButton).to.be.disabled();

      const tooltip = wrapper
        .find('OauthConnection')
        .at(0)
        .find('ReactTooltip')
        .at(0);
      expect(tooltip).to.include.text(
        'This action cannot be done from the Maker App.'
      );
    });

    it('Microsoft, Clever, and Facebook buttons are enabled with no tooltips', () => {
      const wrapper = mount(<ManageLinkedAccounts {...DEFAULT_PROPS} />);

      expect(wrapper.find('table')).to.exist;
      expect(wrapper.find('OauthConnection').at(1)).to.include.text(
        'Microsoft Account'
      );
      expect(
        wrapper
          .find('OauthConnection')
          .at(1)
          .find('BootstrapButton')
      ).to.not.be.disabled();
      expect(
        wrapper
          .find('OauthConnection')
          .at(1)
          .find('ReactTooltip')
      ).to.not.exist;

      expect(wrapper.find('OauthConnection').at(2)).to.include.text(
        'Clever Account'
      );
      expect(
        wrapper
          .find('OauthConnection')
          .at(2)
          .find('BootstrapButton')
      ).to.not.be.disabled();
      expect(
        wrapper
          .find('OauthConnection')
          .at(2)
          .find('ReactTooltip')
      ).to.not.exist;

      expect(wrapper.find('OauthConnection').at(3)).to.include.text(
        'Facebook Account'
      );
      expect(
        wrapper
          .find('OauthConnection')
          .at(3)
          .find('BootstrapButton')
      ).to.not.be.disabled();
      expect(
        wrapper
          .find('OauthConnection')
          .at(3)
          .find('ReactTooltip')
      ).to.not.exist;
    });
  });
});

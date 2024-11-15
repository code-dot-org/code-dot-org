require 'test_helper'

class Services::User::PasswordResetterByEmailTest < ActiveSupport::TestCase
  let(:described_instance) {described_class.new(email: email)}

  let(:email) {Faker::Internet.unique.email}

  describe '#call' do
    subject(:reset_password) {described_instance.call}

    let(:mail) {ActionMailer::Base.deliveries.first}
    let!(:user) {create(:user, email: email)}

    it 'returns user with generated reset password tokens' do
      _reset_password.must_equal user
      _(reset_password.reset_password_token).wont_be_nil
      _(reset_password.reset_password_sent_at).wont_be_nil
      _(reset_password.raw_token).wont_be_nil
    end

    it 'sends a password reset email' do
      reset_password
      _(mail).wont_be_nil
      _(mail.to).must_equal [email]
      _(mail.subject).must_equal 'Code.org reset password instructions'
    end

    context 'when account is unmigrated' do
      let!(:user) {create(:user, :demigrated, email: email)}

      it 'returns user with generated reset password tokens' do
        _reset_password.must_equal user
        _(reset_password.reset_password_token).wont_be_nil
        _(reset_password.reset_password_sent_at).wont_be_nil
        _(reset_password.raw_token).wont_be_nil
      end

      it 'sends a password reset email' do
        reset_password
        _(mail).wont_be_nil
        _(mail.to).must_equal [email]
        _(mail.subject).must_equal 'Code.org reset password instructions'
      end
    end

    context 'when account is an lti account' do
      let!(:user) {create(:teacher, :with_lti_auth)}
      # Email is changed by lti auth option, so we need to reference that email
      let!(:email) {user.email}

      context 'when account does not have email authentication' do
        it 'tracks PasswordResetEmailAuthNotFound metric' do
          expected_env = 'expected_env'

          CDO.expects(:rack_env).returns(expected_env)
          Cdo::Metrics.
            expects(:put).
            with('User', 'PasswordResetEmailAuthNotFound', 1, {Environment: expected_env}).
            once

          reset_password
        end

        it 'returns new user instance without reset password tokens' do
          _reset_password.must_be_instance_of User
          _(reset_password.reset_password_token).must_be_nil
          _(reset_password.reset_password_sent_at).must_be_nil
          _(reset_password.raw_token).must_be_nil
        end

        it 'does not send a password reset email' do
          reset_password
          _(mail).must_be_nil
        end
      end

      context 'when account has email authentication' do
        let(:email_auth_option) {create(:authentication_option, email: email)}

        before do
          user.authentication_options.append(email_auth_option)
        end

        it 'returns user with generated reset password tokens' do
          _reset_password.must_equal user
          _(reset_password.reset_password_token).wont_be_nil
          _(reset_password.reset_password_sent_at).wont_be_nil
          _(reset_password.raw_token).wont_be_nil
        end

        it 'sends a password reset email' do
          reset_password
          _(mail).wont_be_nil
          _(mail.to).must_equal [email]
          _(mail.subject).must_equal 'Code.org reset password instructions'
        end
      end
    end

    context 'when account is a google account' do
      let!(:user) {create(:teacher, :with_google_authentication_option, email: email)}

      context 'when account does not have email authentication' do
        before do
          user.authentication_options.find_by(credential_type: 'email').destroy
        end

        it 'tracks PasswordResetEmailAuthNotFound metric' do
          expected_env = 'expected_env'

          CDO.expects(:rack_env).returns(expected_env)
          Cdo::Metrics.
            expects(:put).
            with('User', 'PasswordResetEmailAuthNotFound', 1, {Environment: expected_env}).
            once

          reset_password
        end

        it 'returns new user instance without reset password tokens' do
          _reset_password.must_be_instance_of User
          _(reset_password.reset_password_token).must_be_nil
          _(reset_password.reset_password_sent_at).must_be_nil
          _(reset_password.raw_token).must_be_nil
        end

        it 'does not send a password reset email' do
          reset_password
          _(mail).must_be_nil
        end
      end

      context 'when account has email authentication' do
        it 'returns user with generated reset password tokens' do
          _reset_password.must_equal user
          _(reset_password.reset_password_token).wont_be_nil
          _(reset_password.reset_password_sent_at).wont_be_nil
          _(reset_password.raw_token).wont_be_nil
        end

        it 'sends a password reset email' do
          reset_password
          _(mail).wont_be_nil
          _(mail.to).must_equal [email]
          _(mail.subject).must_equal 'Code.org reset password instructions'
        end
      end
    end
    context 'when user does not exist' do
      let(:user) {nil}

      it 'tracks PasswordResetUserNotFound metric' do
        expected_env = 'expected_env'

        CDO.expects(:rack_env).returns(expected_env)
        Cdo::Metrics.
          expects(:put).
          with('User', 'PasswordResetUserNotFound', 1, {Environment: expected_env}).
          once

        reset_password
      end

      it 'returns new user instance without reset password tokens' do
        _reset_password.must_be_instance_of User
        _(reset_password.reset_password_token).must_be_nil
        _(reset_password.reset_password_sent_at).must_be_nil
        _(reset_password.raw_token).must_be_nil
      end
    end
  end
end

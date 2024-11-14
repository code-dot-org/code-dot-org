require 'test_helper'

class Services::User::PasswordResetterByUsernameTest < ActiveSupport::TestCase
  let(:described_instance) {described_class.new(username: username)}

  let(:username) {Faker::Internet.unique.username(specifier: 5..19)}

  describe '#call' do
    subject(:reset_password) {described_instance.call}

    let!(:user) {create(:user)}

    before do
      user&.update!(username: username)
    end

    it 'does not send password reset' do
      reset_password
      _(ActionMailer::Base.deliveries.first).must_be_nil
    end

    it 'tracks PasswordResetByUsername metric' do
      expected_env = 'expected_env'

      CDO.expects(:rack_env).returns(expected_env)
      Cdo::Metrics.
        expects(:put).
        with('User', 'PasswordResetByUsername', 1, {Environment: expected_env}).
        once

      reset_password
    end

    it 'returns user with generated reset password tokens' do
      _reset_password.must_equal user
      _(reset_password.reset_password_token).wont_be_nil
      _(reset_password.reset_password_sent_at).wont_be_nil
      _(reset_password.raw_token).wont_be_nil
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

require 'test_helper'

class Services::User::MultiAuthMigratorTest < ActiveSupport::TestCase
  let(:described_instance) {described_class.new(user: user)}
  let!(:user) {build(:user, provider: provider, encrypted_password: nil)}
  let(:provider) {'manual'}

  describe '#call' do
    subject(:migrate) {described_instance.call}

    it 'migrates user to multi auth' do
      migrate
      _(user.migrated?).must_equal true
      _(user.authentication_options.first).wont_be_nil
    end

    context 'when already migrated' do
      let(:provider) {'migrated'}

      it 'is still migrated' do
        _(migrate).must_equal true
        _(user.migrated?).must_equal true
      end
    end

    context 'when sponsored' do
      let(:provider) {'sponsored'}

      it 'is migrated and still sponsored' do
        migrate
        _(user.migrated?).must_equal true
        _(user.sponsored?).must_equal true
      end

      it 'does not add an auth option' do
        migrate
        _(user.authentication_options).must_be_empty
      end
    end

    context 'when Google' do
      let(:user) {build(:user, :google_sso_provider)}

      it 'migrates the user' do
        migrate
        _(user.migrated?).must_equal true
      end

      it 'creates the correct auth option' do
        migrate
        _(user.authentication_options.first.credential_type).must_equal AuthenticationOption::GOOGLE
        _(user.authentication_options.first.data).wont_be_nil
      end

      it 'sets legacy auth fields to nil' do
        migrate
        _(user.uid).must_be_nil
        _(user.oauth_token).must_be_nil
        _(user.oauth_token_expiration).must_be_nil
        _(user.oauth_refresh_token).must_be_nil
      end
    end

    context 'when Clever' do
      let(:user) {build(:user, :clever_sso_provider)}

      it 'migrates the user' do
        migrate
        _(user.migrated?).must_equal true
      end

      it 'creates the correct auth option' do
        migrate
        _(user.authentication_options.first.credential_type).must_equal AuthenticationOption::CLEVER
        _(user.authentication_options.first.data).wont_be_nil
      end
    end

    context 'when Microsoft' do
      let(:user) {build(:user, :microsoft_v2_sso_provider)}

      it 'migrates the user' do
        migrate
        _(user.migrated?).must_equal true
      end

      it 'creates the correct auth option' do
        migrate
        _(user.authentication_options.first.credential_type).must_equal AuthenticationOption::MICROSOFT
        _(user.authentication_options.first.data).wont_be_nil
      end
    end

    context 'when Facebook' do
      let(:user) {build(:user, :facebook_sso_provider)}

      it 'migrates the user' do
        migrate
        _(user.migrated?).must_equal true
      end

      it 'creates the correct auth option' do
        migrate
        _(user.authentication_options.first.credential_type).must_equal AuthenticationOption::FACEBOOK
        _(user.authentication_options.first.data).wont_be_nil
      end
    end

    context 'when provider is not supported' do
      let(:provider) {'foo_provider'}

      it 'raises an exception' do
        error = _ {migrate}.must_raise RuntimeError
        _(error.message).must_equal "Migration not implemented for provider #{provider}"
      end
    end
  end
end

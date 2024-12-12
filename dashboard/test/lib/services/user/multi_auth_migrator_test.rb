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

      it 'returns true' do
        _(migrate).must_equal true
      end
    end

    context 'when sponsored' do
      let(:provider) {'sponsored'}

      it 'is still sponsored' do
        migrate
        _(user.sponsored?).must_equal true
      end

      it 'does not add an auth option' do
        migrate
        _(user.authentication_options).must_be_empty
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

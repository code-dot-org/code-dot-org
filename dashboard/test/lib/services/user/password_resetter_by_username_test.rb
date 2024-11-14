require 'test_helper'

class Services::User::PasswordResetterByUsernameTest < ActiveSupport::TestCase
  let(:described_instance) {described_class.new(username: username)}

  let(:username) {Faker::Internet.unique.username(specifier: 5..19)}

  describe '#call' do
    subject(:reset_password) {described_instance.call}

    let(:mail) {ActionMailer::Base.deliveries.first}

    context 'when user is persisted' do
      let!(:user) {create(:user)}
      before do
        user.username = username
        user.save!
      end

      it 'does not send password reset' do
        original_user_id = user.id
        user = reset_password

        _(mail).must_be_nil
        user.id.must_equal original_user_id
        user.raw_token.wont_be_nil
      end
    end
  end
end

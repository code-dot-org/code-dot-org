require 'test_helper'

class Services::User::PasswordResetterTest < ActiveSupport::TestCase
  let(:reset_via_email) {described_class.new(email: email)}
  let(:reset_via_username) {described_class.new(username: username)}

  let(:email) {Faker::Internet.unique.email}
  let(:username) {Faker::Internet.unique.username(specifier: 5..19)}

  describe '#call with username' do
    subject(:reset_password) {reset_via_username.call}

    let(:mail) {ActionMailer::Base.deliveries.first}

    context 'for username with an existing user' do
      let!(:user) {create(:user, email: email)}
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

  describe '#call with email' do
    subject(:reset_password) {reset_via_email.call}

    let(:mail) {ActionMailer::Base.deliveries.first}

    context 'for email without an existing user' do
      let!(:user) {nil}
      it 'does not send password reset' do
        reset_password
        _(mail).must_be_nil
      end
    end
    context 'for email with an existing user' do
      let!(:user) {create(:user, email: email)}
      it 'returns user' do
        reset_password.must_equal user
      end
    end

    context 'for de-migrated account' do
      let!(:user) {create(:teacher, :demigrated, email: email)}
      it 'sends password reset instructions' do
        reset_password

        _(mail).wont_be_nil
        _(mail.to).must_equal [email]
        _(mail.subject).must_equal 'Code.org reset password instructions'
      end
    end

    context 'for lti account' do
      let!(:user) {create(:teacher, :with_lti_auth, email: email)}

      context 'without email authentication' do
        it 'does not send password reset' do
          reset_password
          _(mail).must_be_nil
        end
      end

      context 'with email authentication' do
        let(:email_auth_option) {create(:authentication_option, email: email)}

        before do
          user.authentication_options.append(email_auth_option)
        end

        it 'sends password reset email' do
          reset_password

          _(mail).wont_be_nil
          _(mail.to).must_equal [email]
          _(mail.subject).must_equal 'Code.org reset password instructions'
        end
      end
    end

    context 'for google account' do
      let!(:user) {create(:teacher, :with_google_authentication_option, email: email)}

      context 'without email authentication' do
        before do
          user.authentication_options.find_by(credential_type: 'email').destroy
        end

        it 'does not send password reset' do
          reset_password
          _(mail).must_be_nil
        end
      end

      context 'with email authentication' do
        it 'sends password reset email' do
          reset_password

          _(mail).wont_be_nil
          _(mail.to).must_equal [email]
          _(mail.subject).must_equal 'Code.org reset password instructions'
        end
      end
    end
  end
end

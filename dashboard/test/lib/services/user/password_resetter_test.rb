require 'test_helper'

class Services::User::PasswordResetterTest < ActiveSupport::TestCase
  let(:described_instance) {described_class.new(email: email)}

  let(:email) {Faker::Internet.unique.email}

  describe '#call' do
    subject(:reset_password) {described_instance.call}

    let!(:user) {create(:user, email: email)}
    let(:mail) {ActionMailer::Base.deliveries.first}

    it 'returns user' do
      _reset_password.must_equal user
    end

    context 'for lti account' do
      let!(:user) {create(:teacher, :with_lti_auth, email: email)}

      context 'without email authentication' do
        it 'does not send password reset' do
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

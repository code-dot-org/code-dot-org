require 'test_helper'

class Services::User::UserTypeSetterTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:student) {create(:student)}
  let(:teacher) {create(:teacher)}
  let(:email) {'teacher@email.com'}
  let(:email_preference) {{opt_in: true}}

  describe '#call' do
    subject(:user_type_setter_call) do
      Services::User::UserTypeSetter.call(
        user: user,
        user_type: user_type,
        email: email,
        email_preference: email_preference
      )
    end

    context 'when user_type is teacher' do
      let(:user) {student}
      let(:user_type) {::User::TYPE_TEACHER}

      it 'calls UpgradeToTeacher with correct arguments' do
        allow(Services::User::UpgradeToTeacher).to receive(:call).
          with(user: user, email: email, email_preference: email_preference).
          and_return(true)

        _user_type_setter_call.must_equal true
      end
    end

    context 'when user_type is student' do
      let(:user) {teacher}
      let(:user_type) {::User::TYPE_STUDENT}

      it 'calls DowngradeToStudent with correct arguments' do
        allow(Services::User::DowngradeToStudent).to receive(:call).
          with(user: user).
          and_return(true)

        _user_type_setter_call.must_equal true
      end
    end

    context 'when user_type is unknown' do
      let(:user) {student}
      let(:user_type) {'invalid-type'}

      it {_user_type_setter_call.must_equal false}
    end
  end
end

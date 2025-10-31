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

      it 'logs user_type_changed event with correct metadata' do
        allow(Services::User::UpgradeToTeacher).to receive(:call).and_return(user)

        expect(Metrics::Events).to receive(:log_event).with(
          user: user,
          event_name: 'user_type_changed',
          metadata: {
            from_user_type: ::User::TYPE_STUDENT,
            to_user_type: ::User::TYPE_TEACHER
          }
        )

        user_type_setter_call
      end

      it 'does not log event when user is already a teacher' do
        teacher_user = create(:teacher)

        expect(Metrics::Events).not_to receive(:log_event)

        Services::User::UserTypeSetter.call(
          user: teacher_user,
          user_type: ::User::TYPE_TEACHER,
          email: email,
          email_preference: email_preference
        )
      end

      it 'does not log event when service returns false (failure)' do
        allow(Services::User::UpgradeToTeacher).to receive(:call).and_return(false)

        expect(Metrics::Events).not_to receive(:log_event)

        user_type_setter_call
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

      it 'logs user_type_changed event with correct metadata' do
        allow(Services::User::DowngradeToStudent).to receive(:call).and_return(user)

        expect(Metrics::Events).to receive(:log_event).with(
          user: user,
          event_name: 'user_type_changed',
          metadata: {
            from_user_type: ::User::TYPE_TEACHER,
            to_user_type: ::User::TYPE_STUDENT
          }
        )

        user_type_setter_call
      end

      it 'does not log event when user is already a student' do
        student_user = create(:student)

        expect(Metrics::Events).not_to receive(:log_event)

        Services::User::UserTypeSetter.call(
          user: student_user,
          user_type: ::User::TYPE_STUDENT,
          email: email,
          email_preference: email_preference
        )
      end

      it 'does not log event when service returns false (failure)' do
        allow(Services::User::DowngradeToStudent).to receive(:call).and_return(false)

        expect(Metrics::Events).not_to receive(:log_event)

        user_type_setter_call
      end
    end

    context 'when user_type is unknown' do
      let(:user) {student}
      let(:user_type) {'invalid-type'}

      it {_user_type_setter_call.must_equal false}

      it 'does not log event for invalid user type' do
        expect(Metrics::Events).not_to receive(:log_event)

        user_type_setter_call
      end
    end
  end
end

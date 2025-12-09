require 'test_helper'

class Services::User::DowngradeToStudentTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:user) {create(:user)}

  subject(:downgrade_to_student_call) {Services::User::DowngradeToStudent.call(user: user)}

  describe '#call' do
    context 'when user is already a student' do
      it 'returns true and does not update' do
        expect(user).not_to receive(:update)

        _downgrade_to_student_call.must_equal true
      end
    end

    context 'when user is not a student' do
      it 'updates the user_type to student and clears given name, display name, and cleartext emails' do
        allow(user).to receive(:student?).and_return(false)
        expect(user).to receive(:update).with(
          user_type: ::User::TYPE_STUDENT,
          given_name: nil,
          family_name: nil,
          educator_role: nil
        ).and_return(true)

        _downgrade_to_student_call.must_equal true
        user.reload
        _(user.email).must_be :blank?
        _(user.given_name).must_be :blank?
        _(user.family_name).must_be :blank?
      end
    end

    context 'when update fails' do
      it 'returns false' do
        allow(user).to receive(:student?).and_return(false)
        allow(user).to receive(:update).with(
          user_type: ::User::TYPE_STUDENT,
          given_name: nil,
          family_name: nil,
          educator_role: nil,
        ).and_return(false)

        _downgrade_to_student_call.must_equal false
      end
    end
  end
end

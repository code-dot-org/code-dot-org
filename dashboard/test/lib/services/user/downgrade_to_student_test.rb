require 'test_helper'

class Services::User::DowngradeToStudentTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:user) {create(:teacher)}

  subject(:downgrade_to_student_call) {Services::User::DowngradeToStudent.call(user: user)}

  describe '#call' do
    context 'when user is already a student' do
      let(:user) {create(:student)}

      it 'returns true and does not update' do
        expect(user).not_to receive(:update)

        _downgrade_to_student_call.must_equal true
      end
    end

    context 'when user is not a student' do
      it 'updates the user_type to student and clears given name, display name, and cleartext emails' do
        _downgrade_to_student_call.must_equal true
        student = User.find(user.id)
        _(student).must_be :student?
        _(student.email).must_be :blank?
        _(student.given_name).must_be :blank?
        _(student.family_name).must_be :blank?
      end

      it 'destroys sections owned by the user, including demo sections' do
        section = create(:section, user: user)
        demo_section = create(:section, user: user, demo_type: 'high')

        _downgrade_to_student_call.must_equal true

        _(Section.exists?(section.id)).must_equal false
        _(Section.exists?(demo_section.id)).must_equal false
      end

      it 'removes the user from sections owned by another teacher' do
        section = create(:section)
        section.add_instructor(user)

        _downgrade_to_student_call.must_equal true

        _(Section.exists?(section.id)).must_equal true
        _(section.instructors.reload).wont_include user
      end
    end

    context 'when update fails' do
      it 'returns false and restores destroyed sections' do
        section = create(:section, user: user)
        allow(user).to receive(:update).with(
          user_type: ::User::TYPE_STUDENT,
          given_name: nil,
          family_name: nil,
          educator_role: nil,
        ).and_return(false)

        _downgrade_to_student_call.must_equal false
        _(Section.exists?(section.id)).must_equal true
      end
    end
  end
end

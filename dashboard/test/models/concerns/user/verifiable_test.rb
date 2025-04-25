require 'test_helper'

class VerifiableTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  describe '#verify_teacher!' do
    let(:teacher) {create :teacher}

    before do
      UserPermission.any_instance.stubs(:send_verified_teacher_email)
      teacher.verify_teacher!
    end

    it 'sets the permission correctly' do
      permission_values = teacher.permissions.map(&:permission)
      _(permission_values).must_include UserPermission::AUTHORIZED_TEACHER
    end
  end

  describe '#verified_teacher?' do
    subject(:verified_teacher?) {user.verified_teacher?}
    context 'when the user is a normal teacher' do
      let(:user) {create :teacher}
      it {_verified_teacher?.must_equal false}
    end
    context 'when the user is has verified permissions' do
      let(:user) {create :teacher}
      before do
        user.permission = UserPermission::AUTHORIZED_TEACHER
      end
      it {_verified_teacher?.must_equal true}
    end
    context 'when the user is in a plc course' do
      let(:user) {create :teacher}
      before do
        create(:plc_user_course_enrollment, user: user, plc_course: create(:plc_course))
      end
      it {_verified_teacher?.must_equal true}
    end
    context 'when the user is a student' do
      let(:user) {create :student}
      it {_verified_teacher?.must_equal false}
    end
  end
  describe '#verified_instructor?' do
    subject(:verified_instructor?) {user.verified_instructor?}
    context 'when the user is a normal teacher' do
      let(:user) {create :teacher}
      it {_verified_instructor?.must_equal false}
    end
    context 'when the user is has verified permissions' do
      let(:user) {create :teacher}
      before do
        user.permission = UserPermission::AUTHORIZED_TEACHER
      end
      it {_verified_instructor?.must_equal true}
    end
    context 'when the instructor is also an admin' do
      let(:user) {create :admin}
      it {_verified_instructor?.must_equal false}
    end
    context 'when the instructor is also a facilitator' do
      let(:user) {create :facilitator}
      it {_verified_instructor?.must_equal true}
    end
    context 'when the instructor is a universal instructor' do
      let(:user) {create :universal_instructor}
      it {_verified_instructor?.must_equal true}
    end
    context 'when the user is a plc reviewer' do
      let(:user) {create :plc_reviewer}
      it {_verified_instructor?.must_equal true}
    end
    context 'when the user is a levelbuilder' do
      let(:user) {create :levelbuilder}
      it {_verified_instructor?.must_equal true}
    end
    context 'when the user is a student' do
      let(:user) {create :student}
      it {_verified_instructor?.must_equal false}
    end
  end
end

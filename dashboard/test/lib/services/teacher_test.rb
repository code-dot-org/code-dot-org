require 'test_helper'

class Services::TeacherTest < ActiveSupport::TestCase
  let(:user) {create(:teacher)}

  describe '.verify' do
    subject(:verified_user) {described_class.verify(user)}

    context 'when user is a teacher' do
      before do
        user.update(user_type: User::TYPE_TEACHER)
      end

      it 'returns true if the user is already a verified teacher' do
        user.permission = UserPermission::AUTHORIZED_TEACHER
        _verified_user.must_equal true
      end

      it 'updates the permission to AUTHORIZED_TEACHER if the user is a teacher' do
        _verified_user.must_equal true
        user.reload.permission?(UserPermission::AUTHORIZED_TEACHER).must_equal true
      end

      it 'returns false if the user save fails' do
        user.stubs(:save).returns(false)
        _verified_user.must_equal false
      end
    end

    context 'when user is a student' do
      before do
        user.update(user_type: User::TYPE_STUDENT)
      end

      it 'returns false if the user is not a teacher' do
        _verified_user.must_equal false
        user.reload.permission?(UserPermission::AUTHORIZED_TEACHER).must_equal false
      end
    end
  end
end

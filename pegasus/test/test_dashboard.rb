# Tests for the Dashboard helpers module, including the User helper object

require_relative './test_helper'
require_relative '../helper_modules/dashboard'
require_relative 'fixtures/fake_dashboard'

class DashboardTest < Minitest::Test
  describe 'Dashboard::User' do
    before do
      FakeDashboard.use_fake_database
      @student = Dashboard::User.get(FakeDashboard::STUDENT[:id])
      @deleted_student = Dashboard::User.
                         get(FakeDashboard::STUDENT_DELETED[:id])
      @teacher = Dashboard::User.get(FakeDashboard::TEACHER[:id])
    end

    describe 'to_hash' do
      it 'returns dashboard row.to_hash' do
        assert_equal(FakeDashboard::STUDENT, @student.to_hash)
        assert_equal(FakeDashboard::TEACHER, @teacher.to_hash)
      end
    end

    describe 'get' do
      it 'does return students' do
        assert @student
      end

      it 'does not return deleted students' do
        assert_nil @deleted_student
      end
    end
  end
end

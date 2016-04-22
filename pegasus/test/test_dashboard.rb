# Tests for the Dashboard helpers module, including the User helper object

require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative '../helper_modules/dashboard'
require_relative 'fixtures/fake_dashboard'

ENV['RACK_ENV'] = 'test'

class DashboardTest < Minitest::Test
  describe 'Dashboard::User' do
    before do
      FakeDashboard.use_fake_database
      @student = Dashboard::User.get(FakeDashboard::STUDENT[:id])
      @deleted_student = Dashboard::User.
        get(FakeDashboard::DELETED_STUDENT[:id])
      @teacher = Dashboard::User.get(FakeDashboard::TEACHER[:id])
      @teacher_with_deleted = Dashboard::User.
        get(FakeDashboard::TEACHER_WITH_DELETED[:id])
      @admin = Dashboard::User.get(FakeDashboard::ADMIN[:id])
      @facilitator = Dashboard::User.get(FakeDashboard::FACILITATOR[:id])
    end

    describe 'to_hash' do
      it 'returns dashboard row.to_hash' do
        assert_equal(FakeDashboard::STUDENT, @student.to_hash)
        assert_equal(FakeDashboard::TEACHER, @teacher.to_hash)
      end
    end

    describe 'select' do
      it 'returns only requested keys when arguments are given' do
        assert_equal({
                          name: FakeDashboard::STUDENT[:name],
                          admin: FakeDashboard::STUDENT[:admin]
                     },
                     @student.select(:name, :admin))
      end

      it 'can add getter methods to requested hash' do
        assert_equal({
                          name: FakeDashboard::STUDENT[:name],
                          owned_sections: []
                     },
                     @student.select(:name, :owned_sections))

        assert_equal({
                         name: FakeDashboard::TEACHER[:name],
                         owned_sections: [
                             {id: FakeDashboard::TEACHER_SECTIONS[0][:id]},
                             {id: FakeDashboard::TEACHER_SECTIONS[1][:id]}
                         ]
                     },
                     @teacher.select(:name, :owned_sections))
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

    describe 'has_permission?' do
      it 'admins have "admin" permission' do
        refute @student.has_permission? 'admin'
        refute @teacher.has_permission? 'admin'
        assert @admin.has_permission? 'admin'
      end

      it 'accepts various forms of "admin"' do
        assert @admin.has_permission? 'Admin'
        assert @admin.has_permission? 'ADMIN'
        assert @admin.has_permission? ' admin '
        assert @admin.has_permission? :admin
      end

      it 'teachers have "teacher" permission' do
        refute @student.has_permission? 'teacher'
        assert @teacher.has_permission? 'teacher'
        assert @admin.has_permission? 'teacher' # this user happens to be a teacher too
      end

      it 'accepts various forms of "teacher"' do
        assert @teacher.has_permission? 'Teacher'
        assert @teacher.has_permission? 'TEACHER'
        assert @teacher.has_permission? ' teacher '
        assert @teacher.has_permission? :teacher
      end

      it 'gets other permissions from the database' do
        refute @student.has_permission? 'facilitator'
        refute @teacher.has_permission? 'facilitator'
        refute @admin.has_permission? 'facilitator'
        assert @facilitator.has_permission? 'facilitator'
      end

      it 'accepts various forms of other permissions' do
        assert @facilitator.has_permission? 'Facilitator'
        assert @facilitator.has_permission? 'FACILITATOR'
        assert @facilitator.has_permission? ' facilitator '
        assert @facilitator.has_permission? :facilitator
      end
    end

    describe 'followed_by?' do
      it 'returns true when appropriate' do
        assert @teacher.followed_by?(@student.id)
      end

      it 'returns false when appropriate' do
        assert !@admin.followed_by?(@student.id)
      end

      it 'ignores deleted followers' do
        assert !@teacher_with_deleted.followed_by?(FakeDashboard::SELF_STUDENT[:id])
      end

      it 'ignores deleted students' do
        assert !@teacher_with_deleted.followed_by?(FakeDashboard::DELETED_STUDENT[:id])
      end
    end

    describe 'owned_sections' do
      it 'returns no sections for a student' do
        assert_equal 0, @student.owned_sections.count
      end

      it 'returns sections for a teacher' do
        sections = @teacher.owned_sections
        assert_equal 2, sections.size
        assert_equal [{id: 150001}, {id: 150002}], sections
      end

      it 'does not return deleted sections' do
        sections = @teacher_with_deleted.owned_sections
        assert_equal 1, sections.size
        assert_equal [{id: 150004}], sections
      end
    end
  end
end

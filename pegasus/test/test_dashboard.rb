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
        assert_equal(
          {
            name: FakeDashboard::STUDENT[:name],
            admin: FakeDashboard::STUDENT[:admin]
          },
          @student.select(:name, :admin)
        )
      end

      it 'can add getter methods to requested hash' do
        assert_equal(
          {
            name: FakeDashboard::STUDENT[:name],
            owned_sections: []
          },
          @student.select(:name, :owned_sections)
        )

        assert_equal(
          {
            name: FakeDashboard::TEACHER[:name],
            owned_sections: [
              {id: FakeDashboard::TEACHER_SECTIONS[0][:id]},
              {id: FakeDashboard::TEACHER_SECTIONS[1][:id]},
              {id: FakeDashboard::TEACHER_SECTIONS[5][:id]}
            ]
          },
          @teacher.select(:name, :owned_sections)
        )
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

      it 'ignores deleted sections' do
        teacher_deleted_section = Dashboard::User.get(FakeDashboard::TEACHER_DELETED_SECTION[:id])
        refute teacher_deleted_section.followed_by?(FakeDashboard::STUDENT_DELETED_SECTION[:id])
      end

      it 'ignores deleted followers' do
        teacher_deleted_follower = Dashboard::User.get(FakeDashboard::TEACHER_DELETED_FOLLOWER[:id])
        refute teacher_deleted_follower.followed_by?(FakeDashboard::STUDENT_DELETED_FOLLOWER[:id])
      end

      it 'ignores deleted students' do
        teacher_deleted_user = Dashboard::User.get(FakeDashboard::TEACHER_DELETED_USER[:id])
        refute teacher_deleted_user.followed_by?(FakeDashboard::STUDENT_DELETED[:id])
      end
    end

    describe 'get_followed_bys' do
      it 'returns an appropriate subarray' do
        assert_equal [@student.id],
          @teacher.get_followed_bys([@admin.id, @student.id, @teacher.id])
      end

      it 'ignores_deleted_sections' do
        teacher_deleted_section = Dashboard::User.get(FakeDashboard::TEACHER_DELETED_SECTION[:id])
        assert_equal [],
          teacher_deleted_section.get_followed_bys([FakeDashboard::STUDENT_DELETED_SECTION[:id]])
      end

      it 'ignores deleted followers' do
        teacher_deleted_follower = Dashboard::User.get(FakeDashboard::TEACHER_DELETED_FOLLOWER[:id])
        assert_equal [],
          teacher_deleted_follower.get_followed_bys([FakeDashboard::STUDENT_DELETED_FOLLOWER[:id]])
      end

      it 'ignores deleted students' do
        teacher_deleted_user = Dashboard::User.get(FakeDashboard::TEACHER_DELETED_USER[:id])
        assert_equal [],
          teacher_deleted_user.get_followed_bys([FakeDashboard::STUDENT_DELETED[:id]])
      end
    end

    describe 'owned_sections' do
      it 'returns no sections for a student' do
        assert_equal 0, @student.owned_sections.count
      end

      it 'returns sections for a teacher' do
        sections = @teacher.owned_sections
        assert_equal 3, sections.size
        assert_equal [{id: 150001}, {id: 150002}, {id: 150006}], sections
      end

      it 'does not return deleted sections' do
        teacher_deleted_section = Dashboard::User.get(FakeDashboard::TEACHER_DELETED_SECTION[:id])
        sections = teacher_deleted_section.owned_sections
        assert_equal 0, sections.size
      end
    end
  end
end

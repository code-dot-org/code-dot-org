require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'
require_relative '../src/env'
require 'mocha/mini_test'
require 'sequel'
require_relative '../helpers/section_api_helpers'
require_relative 'fixtures/fake_dashboard'
require_relative 'sequel_test_case'

def remove_dates(string)
  string.gsub(/'[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}'/, 'DATE')
end

class SectionApiHelperTest < SequelTestCase
  describe DashboardStudent do
    before do
      FakeDashboard.use_fake_database
    end

    describe 'fetch_user_students' do
      it 'returns followers' do
        students = DashboardStudent.fetch_user_students(FakeDashboard::TEACHER[:id])
        assert_equal 1, students.length
        assert_equal FakeDashboard::STUDENT[:id], students.first[:id]
      end

      it 'does not return followers of deleted sections' do
        students = DashboardStudent.fetch_user_students FakeDashboard::TEACHER_DELETED_SECTION[:id]
        assert_equal [], students
      end

      it 'does not return deleted followers' do
        students = DashboardStudent.fetch_user_students FakeDashboard::TEACHER_DELETED_FOLLOWER[:id]
        assert_equal [], students
      end

      it 'does not return deleted users' do
        students = DashboardStudent.fetch_user_students FakeDashboard::TEACHER_DELETED_USER[:id]
        assert_equal [], students
      end
    end

    describe 'update_if_allowed' do
      it 'updates students' do
        params = {id: FakeDashboard::STUDENT[:id], name: 'Updated User'}
        Dashboard.db.transaction(rollback: :always) do
          updated_student = DashboardStudent.update_if_allowed(params, FakeDashboard::TEACHER[:id])
          assert_equal 'Updated User', updated_student[:name]
        end
      end

      it 'noops for students in deleted sections' do
        params = {id: FakeDashboard::STUDENT_DELETED_SECTION[:id], name: 'Updated User'}
        updated_student = DashboardStudent.update_if_allowed(
          params, FakeDashboard::TEACHER_DELETED_SECTION[:id]
        )
        assert_nil updated_student
        assert_equal FakeDashboard::STUDENT_DELETED_SECTION[:name],
          Dashboard::User.get(FakeDashboard::STUDENT_DELETED_SECTION[:id]).to_hash[:name]
      end

      it 'noops for deleted followers' do
        params = {id: FakeDashboard::STUDENT_DELETED_FOLLOWER[:id], name: 'Updated User'}
        updated_student = DashboardStudent.update_if_allowed(
          params, FakeDashboard::TEACHER_DELETED_FOLLOWER[:id]
        )
        assert_nil updated_student
        assert_equal FakeDashboard::STUDENT_DELETED_FOLLOWER[:name],
          Dashboard::User.get(FakeDashboard::STUDENT_DELETED_FOLLOWER[:id]).to_hash[:name]
      end

      it 'noops for deleted students' do
        params = {id: FakeDashboard::STUDENT_DELETED[:id], name: 'Updated User'}
        updated_student = DashboardStudent.update_if_allowed(
          params, FakeDashboard::TEACHER_DELETED_USER[:id]
        )
        assert_nil updated_student
        assert_equal FakeDashboard::STUDENT_DELETED[:name],
          Dashboard::User.get_with_deleted(FakeDashboard::STUDENT_DELETED[:id]).to_hash[:name]
      end
    end
  end

  describe DashboardSection do
    before do
      # see http://www.rubydoc.info/github/jeremyevans/sequel/Sequel/Mock/Database
      @fake_db = Sequel.connect "mock://mysql"
      @fake_db.server_version = 50616
      I18n.locale = 'en-US'
      Dashboard.stubs(:db).returns(@fake_db)
    end

    describe 'valid grades' do
      it 'accepts K-12 and Other' do
        assert DashboardSection.valid_grade?("K")
        assert DashboardSection.valid_grade?("1")
        assert DashboardSection.valid_grade?("6")
        assert DashboardSection.valid_grade?("12")
        assert DashboardSection.valid_grade?("Other")
      end

      it 'does not accept invalid numbers and strings' do
        assert !DashboardSection.valid_grade?("Something else")
        assert !DashboardSection.valid_grade?("56")
      end
    end

    describe 'valid courses' do
      before do
        # mock scripts (the first query to the db gets the scripts)
        @fake_db.fetch = [
          {id: 1, name: 'Foo', hidden: false},
          {id: 3, name: 'Bar', hidden: false},
          {id: 4, name: 'mc', hidden: false},
          {id: 5, name: 'hourofcode', hidden: false},
          {id: 6, name: 'minecraft', hidden: false}
        ]
      end

      it 'accepts valid course_ids' do
        assert DashboardSection.valid_course_id?('1')
        assert DashboardSection.valid_course_id?('3')
      end

      it 'does not accept invalid course_ids' do
        assert !DashboardSection.valid_course_id?('2')
        assert !DashboardSection.valid_course_id?('111')
        assert !DashboardSection.valid_course_id?('invalid!!')
      end

      it 'rewrites mc as "Minecraft Adventurer", hourofcode as "Classic Maze"' do
        assert_includes DashboardSection.valid_courses.map {|course| course[:name]}, 'Minecraft Adventurer'
        assert_includes DashboardSection.valid_courses.map {|course| course[:name]}, 'Minecraft Designer'
        assert_includes DashboardSection.valid_courses.map {|course| course[:name]}, 'Classic Maze'
        refute_includes DashboardSection.valid_courses.map {|course| course[:name]}, 'mc'
        refute_includes DashboardSection.valid_courses.map {|course| course[:name]}, 'hourofcode'
      end

      it 'rewrites mc as "Minecraft Adventurer", hourofcode as "Laberinto clásico" in Spanish"' do
        I18n.locale = 'es-ES'
        assert_includes DashboardSection.valid_courses.map {|course| course[:name]}, 'Minecraft Adventurer'
        assert_includes DashboardSection.valid_courses.map {|course| course[:name]}, 'Minecraft Designer'
        assert_includes DashboardSection.valid_courses.map {|course| course[:name]}, 'Laberinto clásico'
        refute_includes DashboardSection.valid_courses.map {|course| course[:name]}, 'mc'
        refute_includes DashboardSection.valid_courses.map {|course| course[:name]}, 'hourofcode'
      end
    end

    describe 'create' do
      it 'creates a row in the database with defaults' do
        params = {
          user: {id: 15, user_type: 'teacher'}
        }
        DashboardSection.create(params)
        assert_match %r(INSERT INTO `sections` \(`user_id`, `name`, `login_type`, `grade`, `script_id`, `code`, `stage_extras`, `created_at`, `updated_at`\) VALUES \(15, 'New Section', 'word', NULL, NULL, '[A-Z&&[^AEIOU]]{6}', 0, DATE, DATE\)), remove_dates(@fake_db.sqls.first)
      end

      it 'creates a row in the database with name' do
        params = {
          user: {id: 15, user_type: 'teacher'},
          name: 'My cool section'
        }
        DashboardSection.create(params)
        assert_match %r(INSERT INTO `sections` \(`user_id`, `name`, `login_type`, `grade`, `script_id`, `code`, `stage_extras`, `created_at`, `updated_at`\) VALUES \(15, 'My cool section', 'word', NULL, NULL, '[A-Z&&[^AEIOU]]{6}', 0, DATE, DATE\)), remove_dates(@fake_db.sqls.first)
      end
    end
  end

  describe 'DashboardSectionMore' do
    before do
      FakeDashboard.use_fake_database
    end

    describe 'teachers' do
      it 'returns an array of hashes of information' do
        pegasus_section = DashboardSection.fetch_if_teacher(
          FakeDashboard::SECTION_NORMAL[:id],
          FakeDashboard::TEACHER[:id]
        )
        teachers = pegasus_section.teachers
        assert_equal(
          [{id: FakeDashboard::TEACHER[:id], location: "/v2/users/#{FakeDashboard::TEACHER[:id]}"}],
          teachers
        )
      end
    end

    describe 'teacher?' do
      it 'returns false for a teacher of a different section' do
        pegasus_section = DashboardSection.fetch_if_teacher(
          FakeDashboard::SECTION_NORMAL[:id],
          FakeDashboard::TEACHER[:id]
        )
        refute pegasus_section.teacher?(FakeDashboard::TEACHER_SELF[:id])
      end

      it 'returns true for a teacher of the section' do
        pegasus_section = DashboardSection.fetch_if_teacher(
          FakeDashboard::SECTION_NORMAL[:id],
          FakeDashboard::TEACHER[:id]
        )
        assert pegasus_section.teacher?(FakeDashboard::TEACHER[:id])
      end
    end

    describe 'remove_student' do
      it 'soft-deletes follower' do
        Dashboard.db.transaction(rollback: :always) do
          pegasus_section = DashboardSection.fetch_if_teacher(
            FakeDashboard::SECTION_NORMAL[:id],
            FakeDashboard::TEACHER[:id]
          )
          removed = pegasus_section.remove_student(FakeDashboard::STUDENT[:id])
          assert removed
        end
      end

      it 'noops for soft-deleted followers' do
        pegasus_section = DashboardSection.fetch_if_teacher(
          FakeDashboard::SECTION_DELETED_FOLLOWER[:id],
          FakeDashboard::TEACHER_DELETED_FOLLOWER[:id]
        )
        removed = pegasus_section.remove_student(FakeDashboard::STUDENT_DELETED_FOLLOWER[:id])
        refute removed
      end
    end

    describe 'add_student' do
      it 'creates a follower for new student' do
        Dashboard.db.transaction(rollback: :always) do
          pegasus_section = DashboardSection.fetch_if_teacher(
            FakeDashboard::SECTION_NORMAL[:id],
            FakeDashboard::TEACHER[:id]
          )

          pegasus_section.add_student(FakeDashboard::STUDENT_SELF)

          assert_equal(
            1,
            Dashboard.db[:followers].where(student_user_id: FakeDashboard::STUDENT_SELF[:id]).count
          )
        end
      end

      it 'restores deleted follower' do
        Dashboard.db.transaction(rollback: :always) do
          pegasus_section = DashboardSection.fetch_if_teacher(
            FakeDashboard::SECTION_DELETED_FOLLOWER[:id],
            FakeDashboard::TEACHER_DELETED_FOLLOWER[:id]
          )

          pegasus_section.add_student(FakeDashboard::STUDENT_DELETED_FOLLOWER)

          assert_equal(
            1,
            Dashboard.db[:followers].
              where(student_user_id: FakeDashboard::STUDENT_DELETED_FOLLOWER[:id]).
              count
          )
          assert_nil Dashboard.db[:followers].
            where(student_user_id: FakeDashboard::STUDENT_DELETED_FOLLOWER[:id]).
            first[:deleted_at]
        end
      end
    end
  end

  describe DashboardUserScript do
    before do
      FakeDashboard.use_fake_database
      @script_id = 1
      @time_in_past = Time.new(2017, 1, 2)
    end

    describe 'assign_script_to_section' do
      it 'noops for an empty section' do
        Dashboard.db.transaction(rollback: :always) do
          DashboardUserScript.assign_script_to_section(
            @script_id,
            FakeDashboard::SECTION_EMPTY[:id]
          )
          assert_equal 0, Dashboard.db[:user_scripts].count
        end
      end

      it 'assigns scripts to followers' do
        Dashboard.db.transaction(rollback: :always) do
          DashboardUserScript.assign_script_to_section(
            @script_id,
            FakeDashboard::SECTION_NORMAL[:id]
          )
          user_scripts = Dashboard.db[:user_scripts].all
          assert_equal 1, user_scripts.count
          assert_equal FakeDashboard::STUDENT[:id], user_scripts.first[:user_id]
        end
      end

      it 'ignores deleted followers' do
        Dashboard.db.transaction(rollback: :always) do
          DashboardUserScript.assign_script_to_section(
            @script_id,
            FakeDashboard::SECTION_DELETED_FOLLOWER[:id]
          )
          user_scripts = Dashboard.db[:user_scripts].all
          assert_equal 0, user_scripts.count
        end
      end
    end

    describe 'assign_script_to_user' do
      it 'creates a new user_scripts if not pre-existing' do
        Dashboard.db.transaction(rollback: :always) do
          user_id = FakeDashboard::STUDENT[:id]

          DashboardUserScript.assign_script_to_user(@script_id, user_id)

          user_scripts = Dashboard.db[:user_scripts].
            where(user_id: user_id, script_id: @script_id).
            all
          assert_equal 1, user_scripts.count
          assert user_scripts.first[:assigned_at]
        end
      end

      it 'assigns user_scripts if one exists without assigned_at' do
        Dashboard.db.transaction(rollback: :always) do
          user_id = FakeDashboard::STUDENT[:id]
          Dashboard.db[:user_scripts].insert(
            user_id: user_id,
            script_id: @script_id,
            created_at: @time_in_past,
            updated_at: @time_in_past
          )

          DashboardUserScript.assign_script_to_user(@script_id, user_id)

          user_scripts = Dashboard.db[:user_scripts].
            where(user_id: user_id, script_id: @script_id).
            all
          assert_equal 1, user_scripts.count
          assert_equal @time_in_past, user_scripts.first[:created_at]
          assert user_scripts.first[:updated_at] > @time_in_past
          assert user_scripts.first[:assigned_at]
        end
      end

      it 'does not update user_scripts if one exists with assigned_at' do
        Dashboard.db.transaction(rollback: :always) do
          user_id = FakeDashboard::STUDENT[:id]
          Dashboard.db[:user_scripts].insert(
            user_id: user_id,
            script_id: @script_id,
            created_at: @time_in_past,
            updated_at: @time_in_past,
            assigned_at: @time_in_past
          )

          DashboardUserScript.assign_script_to_user(@script_id, user_id)

          user_scripts = Dashboard.db[:user_scripts].
            where(user_id: user_id, script_id: @script_id).
            all
          assert_equal 1, user_scripts.count
          assert_equal @time_in_past, user_scripts.first[:updated_at]
          assert_equal @time_in_past, user_scripts.first[:assigned_at]
        end
      end
    end

    describe 'assign_script_to_users' do
      it 'noops if user_ids is empty' do
        Dashboard.db.transaction(rollback: :always) do
          DashboardUserScript.assign_script_to_users(@script_id, [])

          user_scripts = Dashboard.db[:user_scripts].
            where(user_id: [], script_id: @script_id).
            all
          assert_equal 0, user_scripts.count
        end
      end

      it 'creates new user_scripts if not pre-existing' do
        Dashboard.db.transaction(rollback: :always) do
          user_ids = [FakeDashboard::STUDENT[:id], FakeDashboard::STUDENT_SELF[:id]]

          DashboardUserScript.assign_script_to_users(@script_id, user_ids)

          user_scripts = Dashboard.db[:user_scripts].
            where(user_id: user_ids, script_id: @script_id).
            all
          assert_equal 2, user_scripts.count
          user_scripts.each do |user_script|
            assert user_script[:assigned_at]
          end
        end
      end

      it 'assigns user_scripts if exists without assigned_at' do
        Dashboard.db.transaction(rollback: :always) do
          user_ids = [FakeDashboard::STUDENT[:id], FakeDashboard::STUDENT_SELF[:id]]
          user_ids.each do |user_id|
            Dashboard.db[:user_scripts].insert(
              user_id: user_id,
              script_id: @script_id,
              created_at: @time_in_past,
              updated_at: @time_in_past
            )
          end

          DashboardUserScript.assign_script_to_users(@script_id, user_ids)

          user_scripts = Dashboard.db[:user_scripts].
            where(user_id: user_ids, script_id: @script_id).
            all
          assert_equal 2, user_scripts.count
          user_scripts.each do |user_script|
            assert user_script[:assigned_at]
            assert user_script[:updated_at] > @time_in_past
          end
        end
      end

      it 'does not update user_scripts if exists with assigned_at' do
        Dashboard.db.transaction(rollback: :always) do
          user_ids = [FakeDashboard::STUDENT[:id], FakeDashboard::STUDENT_SELF[:id]]
          user_ids.each do |user_id|
            Dashboard.db[:user_scripts].insert(
              user_id: user_id,
              script_id: @script_id,
              created_at: @time_in_past,
              updated_at: @time_in_past,
              assigned_at: @time_in_past
            )
          end

          DashboardUserScript.assign_script_to_users(@script_id, user_ids)

          user_scripts = Dashboard.db[:user_scripts].
            where(user_id: user_ids, script_id: @script_id).
            all
          assert_equal 2, user_scripts.count
          user_scripts.each do |user_script|
            assert_equal @time_in_past, user_script[:assigned_at]
            assert_equal @time_in_past, user_script[:updated_at]
          end
        end
      end
    end
  end
end

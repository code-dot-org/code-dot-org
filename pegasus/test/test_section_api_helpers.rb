require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'
require_relative '../src/env'
require 'mocha/mini_test'
require 'sequel'
require_relative '../helpers/section_api_helpers'
require_relative 'fixtures/fake_dashboard'
require_relative 'sequel_test_case'
require 'timecop'

def remove_dates(string)
  string.gsub(/'[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}'/, 'DATE')
end

class SectionApiHelperTest < SequelTestCase
  describe DashboardStudent do
    before do
      DashboardSection.clear_caches
      FakeDashboard.use_fake_database
    end

    describe 'create' do
      it 'adds row to DB' do
        Dashboard.db.transaction(rollback: :always) do
          params = {
            name: 'DashboardStudent#create',
            gender: 'f',
            age: 14
          }
          DashboardStudent.create params

          new_user = Dashboard.db[:users].where(name: 'DashboardStudent#create').first
          assert new_user
          assert_equal 'DashboardStudent#create', new_user[:name]
          assert_equal 'f', new_user[:gender]
          assert_equal 'student', new_user[:user_type]
          assert_equal 'abracadabra abracadabra', new_user[:secret_words]
          assert_equal 'sponsored', new_user[:provider]
        end
      end
    end

    describe 'fetch_if_allowed' do
      it 'returns nil if not authorized' do
        row = DashboardStudent.fetch_if_allowed(
          FakeDashboard::STUDENT[:id],
          FakeDashboard::TEACHER_SELF[:id]
        )
        assert_nil row
      end

      it 'returns student if teacher' do
        row = DashboardStudent.fetch_if_allowed(
          FakeDashboard::STUDENT[:id],
          FakeDashboard::TEACHER[:id]
        )
        assert row
      end

      it 'returns student if admin' do
        row = DashboardStudent.fetch_if_allowed(
          FakeDashboard::STUDENT[:id],
          FakeDashboard::ADMIN[:id]
        )
        assert row
      end

      it 'does not return deleted students' do
        row = DashboardStudent.fetch_if_allowed(
          FakeDashboard::STUDENT_DELETED[:id],
          FakeDashboard::TEACHER_DELETED_USER[:id]
        )
        assert_nil row
      end

      it 'returns nil for non-existent students' do
        row = DashboardStudent.fetch_if_allowed(
          FakeDashboard::UNUSED_USER_ID,
          FakeDashboard::TEACHER[:id]
        )
        assert_nil row
      end
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
      DashboardSection.clear_caches
      FakeDashboard.use_fake_database
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
        refute DashboardSection.valid_grade?("Something else")
        refute DashboardSection.valid_grade?("56")
      end
    end

    describe 'valid scripts' do
      before do
        I18n.locale = 'en-US'
      end

      it 'returns true for valid script ids' do
        assert DashboardSection.valid_script_id?(FakeDashboard::SCRIPT_FOO[:id].to_s)
        assert DashboardSection.valid_script_id?(FakeDashboard::SCRIPT_FLAPPY[:id].to_s)
      end

      it 'returns false for non-valid script ids' do
        refute DashboardSection.valid_script_id?('2')
        refute DashboardSection.valid_script_id?('111')
        refute DashboardSection.valid_script_id?('invalid!!')
      end

      it 'returns false for alternate course scripts for user without experiment' do
        refute DashboardSection.valid_script_id?(FakeDashboard::SCRIPT_CSP2_ALT[:id].to_s)
        user_id = 1
        refute DashboardSection.valid_script_id?(FakeDashboard::SCRIPT_CSP2_ALT[:id].to_s, user_id)
      end

      it 'returns true for alternate course scripts for teacher with experiment' do
        assert DashboardSection.valid_script_id?(
          FakeDashboard::SCRIPT_CSP2_ALT[:id].to_s,
          FakeDashboard::CSP2_ALT_EXPERIMENT[:min_user_id]
        )
      end

      it 'rewrites mc as "Minecraft Adventurer", hourofcode as "Classic Maze"' do
        assert_includes(
          DashboardSection.valid_scripts.map {|script| script[:name]},
          'Minecraft Adventurer'
        )
        assert_includes(
          DashboardSection.valid_scripts.map {|script| script[:name]},
          'Minecraft Designer'
        )
        assert_includes(
          DashboardSection.valid_scripts.map {|script| script[:name]},
          'Classic Maze'
        )
        refute_includes DashboardSection.valid_scripts.map {|script| script[:name]}, 'mc'
        refute_includes DashboardSection.valid_scripts.map {|script| script[:name]}, 'hourofcode'
      end

      it 'rewrites mc as "Minecraft Adventurer", hourofcode as "Laberinto clásico" in Spanish"' do
        I18n.locale = 'es-ES'
        assert_includes(
          DashboardSection.valid_scripts.map {|script| script[:name]},
          'Minecraft Adventurer'
        )
        assert_includes(
          DashboardSection.valid_scripts.map {|script| script[:name]},
          'Minecraft Designer'
        )
        assert_includes(
          DashboardSection.valid_scripts.map {|script| script[:name]},
          'Laberinto clásico'
        )
        refute_includes DashboardSection.valid_scripts.map {|script| script[:name]}, 'mc'
        refute_includes DashboardSection.valid_scripts.map {|script| script[:name]}, 'hourofcode'
      end

      it 'returns expected info' do
        flappy_script = DashboardSection.valid_scripts.
          find {|script| script[:script_name] == 'flappy'}
        expected = {
          id: 10,
          name: 'Make a Flappy game',
          script_name: 'flappy',
          category: 'Hour of Code',
          position: 10,
          category_priority: 3
        }
        assert_equal expected, flappy_script
      end

      it 'includes default csp scripts' do
        script_ids = DashboardSection.valid_scripts.map {|script| script[:script_name]}
        assert_includes script_ids, 'csp1-2017'
        assert_includes script_ids, 'csp2-2017'
        refute_includes script_ids, 'csp2-alt'
        assert_includes script_ids, 'csp3-2017'
      end

      it 'includes default csp scripts for user without experiment' do
        user_id = 1
        valid_scripts = DashboardSection.valid_scripts(user_id)
        script_names = valid_scripts.map {|script| script[:script_name]}
        assert_includes script_names, 'csp1-2017'
        assert_includes script_names, 'csp2-2017'
        refute_includes script_names, 'csp2-alt'
        assert_includes script_names, 'csp3-2017'

        assert_equal 'Unit 2: Digital Information', valid_scripts.find {|s| s[:script_name] == 'csp2-2017'}[:name]
      end

      it 'only hits the database to check hidden script access on subsequent requests without experiment' do
        user_id = 1
        DashboardSection.valid_scripts(user_id)
        Dashboard.stubs(:hidden_script_access?).returns(false)
        FakeDashboard.stub_database.raises('unexpected call to fake dashboard DB')
        DashboardSection.valid_scripts
        DashboardSection.valid_scripts(user_id)
        DashboardSection.valid_scripts(user_id + 1)
      end

      it 'includes alternate csp scripts for user with experiment' do
        user_id = FakeDashboard::CSP2_ALT_EXPERIMENT[:min_user_id]
        valid_scripts = DashboardSection.valid_scripts(user_id)
        script_names = valid_scripts.map {|script| script[:script_name]}
        assert_includes script_names, 'csp1-2017'
        refute_includes script_names, 'csp2-2017'
        assert_includes script_names, 'csp2-alt'
        assert_includes script_names, 'csp3-2017'

        # Without an entry in the i18n gsheet, the script name is shown.
        assert_equal 'csp2-alt', valid_scripts.find {|s| s[:script_name] == 'csp2-alt'}[:name]
      end

      it 'does not cache alternate scripts as default scripts' do
        user_id = FakeDashboard::CSP2_ALT_EXPERIMENT[:min_user_id]
        valid_scripts = DashboardSection.valid_scripts(user_id)
        script_names = valid_scripts.map {|script| script[:script_name]}
        assert_includes script_names, 'csp2-alt'

        valid_scripts = DashboardSection.valid_scripts
        script_names = valid_scripts.map {|script| script[:script_name]}
        refute_includes script_names, 'csp2-alt'
      end

      it 'caches course experiments for 60 seconds' do
        Dashboard.db.transaction(rollback: :always) do
          Timecop.freeze
          user_id = 1

          # Initially, the user sees the default scripts.
          script_names = DashboardSection.valid_scripts(user_id).map {|script| script[:script_name]}
          assert_includes script_names, 'csp2-2017'
          refute_includes script_names, 'csp2-alt'

          Dashboard.db[:experiments].insert(
            type: 'SingleUserExperiment',
            min_user_id: user_id,
            name: 'csp2-alt-experiment',
            created_at: Time.now,
            updated_at: Time.now,
          )

          # For a period of time after the experiment is set, the user still sees
          # the default scripts.
          Timecop.travel 59
          script_names = DashboardSection.valid_scripts(user_id).map {|script| script[:script_name]}
          assert_includes script_names, 'csp2-2017'
          refute_includes script_names, 'csp2-alt'

          # Beyond 60 seconds after the experiment is set, the user sees the
          # alternate scripts.
          Timecop.travel 2
          script_names = DashboardSection.valid_scripts(user_id).map {|script| script[:script_name]}
          refute_includes script_names, 'csp2-2017'
          assert_includes script_names, 'csp2-alt'

          Timecop.return
        end
      end
    end

    describe 'valid courses' do
      before do
        I18n.locale = 'en-US'
      end

      it 'returns true for valid course ids' do
        assert DashboardSection.valid_course_id?(FakeDashboard::COURSE_CSP[:id])
      end

      it 'returns false for non-valid course ids' do
        refute DashboardSection.valid_course_id?('2')
        refute DashboardSection.valid_course_id?('111')
        refute DashboardSection.valid_course_id?('invalid!!')
      end

      it 'returns expected info' do
        # Use custom i18n strings so that updating strings in gsheet doesnt break test
        test_locale = :"te-ST"
        I18n.locale = test_locale
        custom_i18n = {
          "csp-2017_name" => "CS Principles",
          "full_course_category_name" => "Full Courses"
        }
        I18n.backend.store_translations test_locale, custom_i18n

        csp_course = DashboardSection.valid_courses.find {|course| course[:script_name] == 'csp-2017'}
        expected = {
          id: 15,
          name: 'CS Principles',
          script_name: 'csp-2017',
          category: 'Full Courses',
          position: 0,
          category_priority: 0,
        }
        assert_equal expected, csp_course
      end
    end
  end

  describe DashboardUserScript do
    before do
      DashboardSection.clear_caches
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

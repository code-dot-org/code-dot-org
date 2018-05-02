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
          position: 7,
          category_priority: 2
        }
        assert_equal expected, flappy_script
      end

      it 'includes default csp scripts' do
        script_ids = DashboardSection.valid_scripts.map {|script| script[:script_name]}
        assert_includes script_ids, 'csp1'
        assert_includes script_ids, 'csp2'
        refute_includes script_ids, 'csp2-alt'
        assert_includes script_ids, 'csp3'
      end

      it 'includes default csp scripts for user without experiment' do
        user_id = 1
        valid_scripts = DashboardSection.valid_scripts(user_id)
        script_names = valid_scripts.map {|script| script[:script_name]}
        assert_includes script_names, 'csp1'
        assert_includes script_names, 'csp2'
        refute_includes script_names, 'csp2-alt'
        assert_includes script_names, 'csp3'

        assert_equal 'Unit 2: Digital Information', valid_scripts.find {|s| s[:script_name] == 'csp2'}[:name]
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
        assert_includes script_names, 'csp1'
        refute_includes script_names, 'csp2'
        assert_includes script_names, 'csp2-alt'
        assert_includes script_names, 'csp3'

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
          assert_includes script_names, 'csp2'
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
          assert_includes script_names, 'csp2'
          refute_includes script_names, 'csp2-alt'

          # Beyond 60 seconds after the experiment is set, the user sees the
          # alternate scripts.
          Timecop.travel 2
          script_names = DashboardSection.valid_scripts(user_id).map {|script| script[:script_name]}
          refute_includes script_names, 'csp2'
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
          "csp_name" => "CS Principles",
          "full_course_category_name" => "Full Courses"
        }
        I18n.backend.store_translations test_locale, custom_i18n

        csp_course = DashboardSection.valid_courses.find {|course| course[:script_name] == 'csp'}
        expected = {
          id: 15,
          name: 'CS Principles',
          script_name: 'csp',
          category: 'Full Courses',
          position: 0,
          category_priority: 0,
        }
        assert_equal expected, csp_course
      end
    end

    describe "fetch_user_sections" do
      before do
        DashboardSection.clear_caches
        FakeDashboard.use_fake_database
      end

      it 'returns all sections belonging to teacher' do
        sections = DashboardSection.fetch_user_sections(FakeDashboard::TEACHER[:id])
        assert_equal 3, sections.length
      end

      it 'specifies course_id for sections that have one assigned' do
        sections = DashboardSection.fetch_user_sections(FakeDashboard::TEACHER[:id])
        sections.each do |section|
          if section[:id] == FakeDashboard::SECTION_COURSE[:id]
            assert_equal FakeDashboard::SECTION_COURSE[:course_id], section[:course_id]
          else
            assert_nil section[:course_id]
          end
        end
      end
    end
  end

  # A set of tests that use our fake database
  describe 'DashboardSectionMore' do
    before do
      DashboardSection.clear_caches
      FakeDashboard.use_fake_database
    end

    describe 'create' do
      it 'creates a row in the database with defaults' do
        params = {
          user: {id: 15, user_type: 'teacher'}
        }
        Dashboard.db.transaction(rollback: :always) do
          row_id = DashboardSection.create(params)

          row = Dashboard.db[:sections].where(id: row_id).first
          assert_equal 15, row[:user_id]
          assert_equal 'New Section', row[:name]
          assert_equal 'word', row[:login_type]
          assert_nil row[:script_id]
          assert_nil row[:course_id]
          assert_nil row[:grade]
          assert !row[:code].nil?
          assert_equal false, row[:stage_extras]
          assert_equal true, row[:pairing_allowed]
        end
      end

      it 'creates a row in the database with name' do
        params = {
          user: {id: 15, user_type: 'teacher'},
          name: 'My cool section'
        }
        Dashboard.db.transaction(rollback: :always) do
          row_id = DashboardSection.create(params)

          row = Dashboard.db[:sections].where(id: row_id).first
          assert_equal 15, row[:user_id]
          assert_equal 'My cool section', row[:name]
          assert_equal 'word', row[:login_type]
          assert_nil row[:script_id]
          assert_nil row[:course_id]
          assert_nil row[:grade]
          assert !row[:code].nil?
          assert_equal false, row[:stage_extras]
          assert_equal true, row[:pairing_allowed]
        end
      end

      it 'creates a row with a course_id and no script_id' do
        params = {
          user: {id: 15, user_type: 'teacher'},
          course_id: FakeDashboard::COURSES[0][:id]
        }
        Dashboard.db.transaction(rollback: :always) do
          row_id = DashboardSection.create(params)

          row = Dashboard.db[:sections].where(id: row_id).first
          assert_equal 15, row[:user_id]
          assert_equal 'New Section', row[:name]
          assert_equal 'word', row[:login_type]
          assert_nil row[:script_id]
          assert_equal params[:course_id], row[:course_id]
          assert_nil row[:grade]
          assert !row[:code].nil?
          assert_equal false, row[:stage_extras]
          assert_equal true, row[:pairing_allowed]
        end
      end

      it 'creates a row with a script_id and no course_id' do
        params = {
          user: {id: 15, user_type: 'teacher'},
          script_id: 1
        }
        Dashboard.db.transaction(rollback: :always) do
          row_id = DashboardSection.create(params)

          row = Dashboard.db[:sections].where(id: row_id).first
          assert_equal 15, row[:user_id]
          assert_equal 'New Section', row[:name]
          assert_equal 'word', row[:login_type]
          assert_equal 1, row[:script_id]
          assert_nil row[:course_id]
          assert_nil row[:grade]
          refute_nil row[:code]
          assert_equal false, row[:stage_extras]
          assert_equal true, row[:pairing_allowed]
        end
      end

      it 'creates a row with both a script_id and a course_id' do
        params = {
          user: {id: 15, user_type: 'teacher'},
          course_id: FakeDashboard::COURSES[0][:id],
          script_id: 1
        }
        Dashboard.db.transaction(rollback: :always) do
          row_id = DashboardSection.create(params)

          row = Dashboard.db[:sections].where(id: row_id).first
          assert_equal 15, row[:user_id]
          assert_equal 'New Section', row[:name]
          assert_equal 'word', row[:login_type]
          assert_equal 1, row[:script_id]
          assert_equal params[:course_id], row[:course_id]
          assert_nil row[:grade]
          refute_nil row[:code]
          assert_equal false, row[:stage_extras]
          assert_equal true, row[:pairing_allowed]
        end
      end

      it 'does not create with alternate script id for user without experiment' do
        user_id = 15
        script_id = FakeDashboard::SCRIPT_CSP2_ALT[:id]
        params = {
          user: {id: user_id, user_type: 'teacher'},
          course_id: FakeDashboard::COURSE_CSP[:id],

          # For some reason, params[:script][:id] and params[:script_id] can
          # both be used to set the script id. However, only
          # params[:script][:id] is specified by the REST API client, and only
          # params[:script][:id] is checked for validity. Therefore, only test
          # params[:script][:id], here and below.
          script: {id: script_id}
        }
        Dashboard.db.transaction(rollback: :always) do
          row_id = DashboardSection.create(params)

          row = Dashboard.db[:sections].where(id: row_id).first
          assert_equal user_id, row[:user_id]
          assert_nil row[:script_id]
          assert_equal params[:course_id], row[:course_id]
        end
      end

      it 'creates with alternate script id for user with experiment' do
        user_id = FakeDashboard::CSP2_ALT_EXPERIMENT[:min_user_id]
        script_id = FakeDashboard::SCRIPT_CSP2_ALT[:id]
        params = {
          user: {id: user_id, user_type: 'teacher'},
          course_id: FakeDashboard::COURSE_CSP[:id],
          script: {id: script_id}
        }
        Dashboard.db.transaction(rollback: :always) do
          row_id = DashboardSection.create(params)

          row = Dashboard.db[:sections].where(id: row_id).first
          assert_equal user_id, row[:user_id]
          assert_equal script_id, row[:script_id]
          assert_equal params[:course_id], row[:course_id]
        end
      end
    end

    describe 'update_if_owner' do
      it 'assigns a script to a section without one' do
        Dashboard.db.transaction(rollback: :always) do
          params = {
            user: {id: 15, user_type: 'teacher'}
          }
          section_id = DashboardSection.create(params)
          row = Dashboard.db[:sections].where(id: section_id).first
          assert_nil row[:course_id]
          assert_nil row[:script_id]

          script_id = FakeDashboard::SCRIPTS[0][:id]

          update_params = {
            id: section_id,
            user: {id: 15, user_type: 'teacher'},
            script: {id: script_id},
            pairing_allowed: true,
            stage_extras: false
          }
          DashboardSection.update_if_owner(update_params)

          row = Dashboard.db[:sections].where(id: section_id).first
          assert_equal script_id, row[:script_id]
        end
      end

      it 'assigns a course to a section without one' do
        Dashboard.db.transaction(rollback: :always) do
          params = {
            user: {id: 15, user_type: 'teacher'}
          }
          section_id = DashboardSection.create(params)
          row = Dashboard.db[:sections].where(id: section_id).first
          assert_nil row[:course_id]
          assert_nil row[:script_id]

          course_id = FakeDashboard::COURSES[0][:id]

          update_params = {
            id: section_id,
            user: {id: 15, user_type: 'teacher'},
            course_id: course_id,
            pairing_allowed: true,
            stage_extras: false
          }
          DashboardSection.update_if_owner(update_params)

          row = Dashboard.db[:sections].where(id: section_id).first
          assert_equal course_id, row[:course_id]
        end
      end

      it 'assigns a course and script to a section' do
        Dashboard.db.transaction(rollback: :always) do
          params = {
            user: {id: 15, user_type: 'teacher'}
          }
          section_id = DashboardSection.create(params)
          row = Dashboard.db[:sections].where(id: section_id).first
          assert_nil row[:course_id]
          assert_nil row[:script_id]

          course_id = FakeDashboard::COURSES[0][:id]
          script_id = FakeDashboard::SCRIPTS[0][:id]

          update_params = {
            id: section_id,
            user: {id: 15, user_type: 'teacher'},
            course_id: course_id,
            script: {id: script_id},
            pairing_allowed: true,
            stage_extras: false
          }
          DashboardSection.update_if_owner(update_params)

          row = Dashboard.db[:sections].where(id: section_id).first
          assert_equal course_id, row[:course_id]
          assert_equal script_id, row[:script_id]
        end
      end

      it 'does not assign invalid script ids to user without experiment' do
        Dashboard.db.transaction(rollback: :always) do
          params = {
            user: {id: 15, user_type: 'teacher'}
          }
          section_id = DashboardSection.create(params)
          row = Dashboard.db[:sections].where(id: section_id).first
          assert_nil row[:course_id]
          assert_nil row[:script_id]

          course_id = FakeDashboard::COURSE_CSP[:id]
          script_id = 999

          update_params = {
            id: section_id,
            user: {id: 15, user_type: 'teacher'},
            course_id: course_id,
            script: {id: script_id},
            pairing_allowed: true,
            stage_extras: false
          }

          DashboardSection.update_if_owner(update_params)
          row = Dashboard.db[:sections].where(id: section_id).first
          assert_equal course_id, row[:course_id]
          assert_nil row[:script_id], 'does not assign invalid script ids'

          script_id = FakeDashboard::SCRIPT_CSP2_ALT[:id]
          DashboardSection.update_if_owner(update_params.merge(script: {id: script_id}))
          row = Dashboard.db[:sections].where(id: section_id).first
          assert_equal course_id, row[:course_id]
          assert_nil row[:script_id],
            'does not assign alternate script ids to user without experiment'
        end
      end

      it 'assigns alternate script ids to user with experiment' do
        Dashboard.db.transaction(rollback: :always) do
          user_id = FakeDashboard::CSP2_ALT_EXPERIMENT[:min_user_id]
          params = {
            user: {id: user_id, user_type: 'teacher'}
          }
          section_id = DashboardSection.create(params)
          row = Dashboard.db[:sections].where(id: section_id).first
          assert_nil row[:course_id]
          assert_nil row[:script_id]

          course_id = FakeDashboard::COURSE_CSP[:id]
          script_id = FakeDashboard::SCRIPT_CSP2_ALT[:id]

          update_params = {
            id: section_id,
            user: {id: user_id, user_type: 'teacher'},
            course_id: course_id,
            script: {id: script_id},
            pairing_allowed: true,
            stage_extras: false
          }

          DashboardSection.update_if_owner(update_params)
          row = Dashboard.db[:sections].where(id: section_id).first
          assert_equal course_id, row[:course_id]
          assert_equal script_id, row[:script_id]
        end
      end

      it 'replaces a script assignment with a course assignment' do
        Dashboard.db.transaction(rollback: :always) do
          params = {
            user: {id: 15, user_type: 'teacher'},
            script_id: 1
          }
          section_id = DashboardSection.create(params)
          row = Dashboard.db[:sections].where(id: section_id).first
          assert_nil row[:course_id]
          assert_equal 1, row[:script_id]

          course_id = FakeDashboard::COURSES[0][:id]

          update_params = {
            id: section_id,
            user: {id: 15, user_type: 'teacher'},
            course_id: course_id,
            pairing_allowed: true,
            stage_extras: false
          }
          DashboardSection.update_if_owner(update_params)

          row = Dashboard.db[:sections].where(id: section_id).first
          assert_equal course_id, row[:course_id]
          assert_nil row[:script_id]
        end
      end

      it 'replaces a course assignment with a script assignment' do
        Dashboard.db.transaction(rollback: :always) do
          course_id = FakeDashboard::COURSES[0][:id]
          script_id = FakeDashboard::SCRIPTS[0][:id]

          params = {
            user: {id: 15, user_type: 'teacher'},
            course_id: course_id
          }
          section_id = DashboardSection.create(params)
          row = Dashboard.db[:sections].where(id: section_id).first
          assert_equal course_id, row[:course_id]
          assert_nil row[:script_id]

          update_params = {
            id: section_id,
            user: {id: 15, user_type: 'teacher'},
            course_id: nil,
            script: {id: script_id},
            pairing_allowed: true,
            stage_extras: false
          }
          DashboardSection.update_if_owner(update_params)

          row = Dashboard.db[:sections].where(id: section_id).first
          assert_nil row[:course_id]
          assert_equal script_id, row[:script_id]
        end
      end

      it 'replaces a course and script assignment with an empty assignment' do
        Dashboard.db.transaction(rollback: :always) do
          course_id = FakeDashboard::COURSES[0][:id]
          script_id = FakeDashboard::SCRIPTS[0][:id]

          params = {
            user: {id: 15, user_type: 'teacher'},
            course_id: course_id,
            script_id: script_id,
          }
          section_id = DashboardSection.create(params)
          row = Dashboard.db[:sections].where(id: section_id).first
          assert_equal course_id, row[:course_id]
          assert_equal 1, row[:script_id]

          update_params = {
            id: section_id,
            user: {id: 15, user_type: 'teacher'},
            course_id: nil,
            script_id: nil,
            pairing_allowed: true,
            stage_extras: false
          }
          DashboardSection.update_if_owner(update_params)

          row = Dashboard.db[:sections].where(id: section_id).first
          assert_nil row[:course_id]
          assert_nil row[:script_id]
        end
      end
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

      it 'returns false for soft-deleted enrollments' do
        pegasus_section = DashboardSection.fetch_if_teacher(
          FakeDashboard::SECTION_DELETED_FOLLOWER[:id],
          FakeDashboard::TEACHER_DELETED_FOLLOWER[:id]
        )
        refute pegasus_section.student?(FakeDashboard::STUDENT_DELETED_FOLLOWER[:id])
      end
    end

    describe 'students' do
      it 'returns hash for section with student without progress' do
        Dashboard.db.transaction(rollback: :always) do
          pegasus_section = DashboardSection.fetch_if_teacher(
            FakeDashboard::SECTION_NORMAL[:id],
            FakeDashboard::TEACHER[:id]
          )
          students = pegasus_section.students
          assert_equal(
            [
              {
                id: FakeDashboard::STUDENT[:id],
                name: FakeDashboard::STUDENT[:name],
                username: nil,
                email: '',
                hashed_email: nil,
                user_type: 'student',
                gender: nil,
                birthday: nil,
                total_lines: 0,
                secret_words: nil,
                secret_picture_name: nil,
                secret_picture_path: nil,
                location: "/v2/users/#{FakeDashboard::STUDENT[:id]}",
                age: nil,
                # completed_levels_count is deprecated and will always be 0
                completed_levels_count: 0
              }
            ],
            students
          )
        end
      end

      it 'returns hash for section with student with progress' do
        Dashboard.db.transaction(rollback: :always) do
          Dashboard.db[:user_levels].insert(
            user_id: FakeDashboard::STUDENT[:id],
            level_id: 1,
            best_result: 100
          )
          pegasus_section = DashboardSection.fetch_if_teacher(
            FakeDashboard::SECTION_NORMAL[:id],
            FakeDashboard::TEACHER[:id]
          )
          students = pegasus_section.students
          assert_equal(
            [
              {
                id: FakeDashboard::STUDENT[:id],
                name: FakeDashboard::STUDENT[:name],
                username: nil,
                email: '',
                hashed_email: nil,
                user_type: 'student',
                gender: nil,
                birthday: nil,
                total_lines: 0,
                secret_words: nil,
                secret_picture_name: nil,
                secret_picture_path: nil,
                location: "/v2/users/#{FakeDashboard::STUDENT[:id]}",
                age: nil,
                # completed_levels_count is deprecated and will always be 0
                completed_levels_count: 0
              }
            ],
            students
          )
        end
      end

      it 'ignores deleted followers' do
        pegasus_section = DashboardSection.fetch_if_teacher(
          FakeDashboard::SECTION_DELETED_FOLLOWER[:id],
          FakeDashboard::TEACHER_DELETED_FOLLOWER[:id]
        )
        assert_equal [], pegasus_section.students
      end

      it 'returns empty array for empty section' do
        pegasus_section = DashboardSection.fetch_if_teacher(
          FakeDashboard::SECTION_EMPTY[:id],
          FakeDashboard::TEACHER[:id]
        )
        assert_equal [], pegasus_section.students
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

      it 'does not create follower for admin student' do
        Dashboard.db.transaction(rollback: :always) do
          pegasus_section = DashboardSection.fetch_if_teacher(
            FakeDashboard::SECTION_NORMAL[:id],
            FakeDashboard::TEACHER[:id]
          )

          pegasus_section.add_student(FakeDashboard::ADMIN)

          assert_equal(
            0,
            Dashboard.db[:followers].where(student_user_id: FakeDashboard::ADMIN[:id]).count
          )
        end
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

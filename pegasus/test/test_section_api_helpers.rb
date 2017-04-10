require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'
require_relative '../src/env'
require 'mocha/mini_test'
require 'sequel'
require_relative '../helpers/section_api_helpers'
require_relative 'fixtures/fake_dashboard'

def remove_dates(string)
  string.gsub(/'[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}'/, 'DATE')
end

class SectionApiHelperTest < Minitest::Test
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
        assert_match %r(INSERT INTO `sections` \(`user_id`, `name`, `login_type`, `grade`, `script_id`, `code`, `created_at`, `updated_at`\) VALUES \(15, 'New Section', 'word', NULL, NULL, '[A-Z&&[^AEIOU]]{6}', DATE, DATE\)), remove_dates(@fake_db.sqls.first)
      end

      it 'creates a row in the database with name' do
        params = {
          user: {id: 15, user_type: 'teacher'},
          name: 'My cool section'
        }
        DashboardSection.create(params)
        assert_match %r(INSERT INTO `sections` \(`user_id`, `name`, `login_type`, `grade`, `script_id`, `code`, `created_at`, `updated_at`\) VALUES \(15, 'My cool section', 'word', NULL, NULL, '[A-Z&&[^AEIOU]]{6}', DATE, DATE\)), remove_dates(@fake_db.sqls.first)
      end
    end
  end

  describe DashboardUserScript do
    # TODO(asher): Add tests here.
  end
end

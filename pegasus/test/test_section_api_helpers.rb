require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'
require_relative '../src/env'
require 'mocha/mini_test'

# mock the database connection
# see http://www.rubydoc.info/github/jeremyevans/sequel/Sequel/Mock/Database
require 'sequel'
DASHBOARD_DB = Sequel.connect "mock://mysql"
DASHBOARD_DB.server_version = 50616
# mock scripts (the first query to the db gets the scripts)
DASHBOARD_DB.fetch = [{id: 1, name: 'Foo', hidden: '0'}, {id: 3, name: 'Bar', hidden: '0'}]


# stuff we're testing
require_relative '../helpers/section_api_helpers'

def remove_dates(string)
  string.gsub(/'[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}'/, 'DATE')
end

class SectionApiHelperTest < Minitest::Unit::TestCase
  describe DashboardSection do
    before do
      DASHBOARD_DB.fetch = {}
      DASHBOARD_DB.sqls.clear
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
      it 'accepts valid course_ids' do
        assert DashboardSection.valid_course_id?('1')
        assert DashboardSection.valid_course_id?('3')
      end

      it 'does not accept invalid course_ids' do
        assert !DashboardSection.valid_course_id?('2')
        assert !DashboardSection.valid_course_id?('111')
        assert !DashboardSection.valid_course_id?('invalid!!')
      end
    end

    describe 'create' do
      it 'creates a row in the database with defaults' do
        params = {
                  user: {id: 15, user_type: 'teacher'}
                 }
        DashboardSection.create(params)
        assert_match %r(INSERT INTO `sections` \(`user_id`, `name`, `login_type`, `grade`, `script_id`, `code`, `created_at`, `updated_at`\) VALUES \(15, 'New Section', 'word', NULL, NULL, '[A-Z]{6}', DATE, DATE\)), remove_dates(DASHBOARD_DB.sqls.first)
      end

      it 'creates a row in the database with name' do
        params = {
                  user: {id: 15, user_type: 'teacher'},
                  name: 'My cool section'
                 }
        DashboardSection.create(params)
        assert_match %r(INSERT INTO `sections` \(`user_id`, `name`, `login_type`, `grade`, `script_id`, `code`, `created_at`, `updated_at`\) VALUES \(15, 'My cool section', 'word', NULL, NULL, '[A-Z]{6}', DATE, DATE\)), remove_dates(DASHBOARD_DB.sqls.first)
      end

    end
  end

  describe DashboardStudent do

  end

  describe DashboardUserScript do

  end
end

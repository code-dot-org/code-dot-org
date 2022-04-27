require 'test_helper'

class Policies::ActiveRecordRolesTest < ActiveSupport::TestCase
  test 'get_writing_role_name' do
    assert_equal Policies::ActiveRecordRoles.get_writing_role_name, :primary
  end

  test 'get_reading_role_name without a configured replica' do
    test_config_hash = {
      Rails.env => {
        primary: {url: "mysql://localhost/mock_primary"},
        secondary: {url: "mysql://localhost/mock_secondary"}
      }
    }

    test_config = ActiveRecord::DatabaseConfigurations.new(test_config_hash)
    ActiveRecord::Base.stubs(:configurations).returns(test_config)
    assert_equal Policies::ActiveRecordRoles.get_reading_role_name, :primary
  end

  test 'get_reading_role_name with a single configured replica' do
    test_config_hash = {
      Rails.env => {
        primary: {url: "mysql://localhost/mock_primary"},
        secondary: {url: "mysql://localhost/mock_secondary", replica: true}
      }
    }

    test_config = ActiveRecord::DatabaseConfigurations.new(test_config_hash)
    ActiveRecord::Base.stubs(:configurations).returns(test_config)
    assert_equal Policies::ActiveRecordRoles.get_reading_role_name, :secondary
  end

  test 'get_reading_role_name with multiple configured replicas' do
    test_config_hash = {
      Rails.env => {
        primary: {url: "mysql://localhost/mock_primary"},
        secondary: {url: "mysql://localhost/mock_secondary", replica: true},
        tertiary: {url: "mysql://localhost/mock_tertiary", replica: true}
      }
    }

    test_config = ActiveRecord::DatabaseConfigurations.new(test_config_hash)
    ActiveRecord::Base.stubs(:configurations).returns(test_config)
    assert_equal Policies::ActiveRecordRoles.get_reading_role_name, :secondary
  end
end

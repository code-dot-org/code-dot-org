require 'test_helper'

class AdminFunometerControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    # Stub used by :funometer.
    Properties.stubs(:get).returns(nil)
  end

  # TODO(asher): Add tests that test controller functionality beyond requiring admin authentication.

  generate_admin_only_tests_for :funometer
  generate_admin_only_tests_for :funometer_by_script, script_id: 1
  generate_admin_only_tests_for :funometer_by_stage, stage_id: 1
  generate_admin_only_tests_for :funometer_by_script_level, script_id: 1, level_id: 1
end

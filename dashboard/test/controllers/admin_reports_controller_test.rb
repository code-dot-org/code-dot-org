require 'test_helper'

class AdminReportsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    sign_in create(:admin)
  end

  generate_admin_only_tests_for :debug
  generate_admin_only_tests_for :directory
  generate_admin_only_tests_for :level_answers
end

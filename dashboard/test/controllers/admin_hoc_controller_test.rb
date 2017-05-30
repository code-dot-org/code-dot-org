require 'test_helper'

class AdminHocControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    # Stub the Properties table (used by :students_served).
    Properties.stubs(:get).returns(nil)
  end

  generate_admin_only_tests_for :students_served
end

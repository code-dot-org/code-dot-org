require 'test_helper'
require 'webmock/minitest'

class AiIterationControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @controller = AiIterationController.new
  end

  # Anonymous, signed-out user cannot access the tools page
  test_user_gets_response_for :tools,
  name: "no_user_no_access_test",
  user: nil,
  method: :get,
  response: :redirect

  # Student cannot access the tools page
  test_user_gets_response_for :tools,
  name: "student_no_access_test",
  user: :student,
  method: :get,
  response: :forbidden

  # Teacher cannot access the tools page
  test_user_gets_response_for :tools,
  name: "teacher_no_access_test",
  user: :teacher,
  method: :get,
  response: :forbidden

  # Levelbuiilder cannot access the tools page
  test_user_gets_response_for :tools,
  name: "levelbuilder_no_access_test",
  user: :levelbuilder,
  method: :get,
  response: :forbidden

  # AI Tutor Access cannot access the tools page
  test_user_gets_response_for :tools,
  name: "ai_tutor_permissions_no_access_test",
  user: :ai_tutor_access,
  method: :get,
  response: :forbidden

  # AI Tutor Access + Levelbuilder can access the tools page
  test_user_gets_response_for :tools,
  name: "ai_iteration_tools_user_can_access_test",
  user: :ai_iteration_tools_user,
  method: :get,
  response: :ok
end

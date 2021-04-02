require 'test_helper'

class Plc::CourseUnitsControllerTest < ActionController::TestCase
  setup do
    @admin = create(:admin)

    @plc_course = create(:plc_course)
    @course_unit = create(:plc_course_unit, plc_course: @plc_course, unit_name: 'PLC Course')
  end

  # only admins can view the plc course launch page
  test_user_gets_response_for :launch, params: -> {}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :launch, params: -> {}, user: :student, response: :forbidden
  test_user_gets_response_for :launch, params: -> {}, user: :teacher, response: :forbidden
  test_user_gets_response_for :launch, params: -> {}, user: :levelbuilder, response: :forbidden
  test_user_gets_response_for :launch, params: -> {}, user: :admin, response: :success

  # only admins can call launch plc course
  test_user_gets_response_for :launch_plc_course, method: :post, params: -> {{plc_course_unit_id: @course_unit.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :launch_plc_course, method: :post, params: -> {{plc_course_unit_id: @course_unit.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :launch_plc_course, method: :post, params: -> {{plc_course_unit_id: @course_unit.id}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :launch_plc_course, method: :post, params: -> {{plc_course_unit_id: @course_unit.id}}, user: :levelbuilder, response: :forbidden
  test_user_gets_response_for :launch_plc_course, method: :post, params: -> {{plc_course_unit_id: @course_unit.id}}, user: :admin, response: :redirect, redirected_to: '/plc/course_units/launch?notice=PLC+Course+was+launched'

  test "launching course sets started to true" do
    sign_in(@admin)
    refute @course_unit.started
    post :launch_plc_course, params: {plc_course_unit_id: @course_unit.id}
    @course_unit.reload
    assert @course_unit.started
  end
end

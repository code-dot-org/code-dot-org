require 'test_helper'

class Plc::CourseUnitControllerTest < ActionController::TestCase
  setup do
    @plc_course = create(:plc_course)
    @course_unit = create(:plc_course_unit, plc_course: @plc_course, unit_name: 'PLC Course')
  end

  test "launching course sets started to true" do
    refute @course_unit.started
    post :launch_plc_course, params: {plc_course_unit_id: @course_unit.id}
    @course_unit.reload
    assert @course_unit.started
  end
end

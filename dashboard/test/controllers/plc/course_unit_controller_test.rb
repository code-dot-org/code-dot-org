require 'test_helper'

class Plc::CourseUnitControllerTest < ActionController::TestCase
  setup do
    @plc_course = create(:plc_course)
    @course_unit = create(:plc_course_unit, plc_course: @plc_course, unit_name: 'PLC Course')

    custom_i18n = {
      'data' => {
        'script' => {
          'name' => {
            @course_unit.script.name => {
              'title' => @course_unit.unit_name
            }
          }
        }
      }
    }

    I18n.backend.store_translations 'en-US', custom_i18n
  end

  test "launching course sets started to true" do
    refute @course_unit.started
    put :launch, params: {course_unit_name: @course_unit.script.title_for_display}
    @course_unit.reload
    assert @course_unit.started
  end
end

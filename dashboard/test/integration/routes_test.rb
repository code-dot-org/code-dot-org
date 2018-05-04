require 'test_helper'

class RoutesTest < ActionDispatch::IntegrationTest
  # Ensure view-only wildcard routes are generated correctly.
  def test_api_routes
    assert_recognizes({controller: 'api', action: 'k5_courses'}, '/dashboardapi/k5_courses')
    assert_recognizes({controller: 'api', action: 'hoc_courses'}, '/api/hoc_courses')
  end

  def test_section_student_script_ids_routes
    assert_recognizes({controller: 'api/v1/sections', action: 'student_script_ids', id: '3'}, '/dashboardapi/sections/3/student_script_ids')
  end
end

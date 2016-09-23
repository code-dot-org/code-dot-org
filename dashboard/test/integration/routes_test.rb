require 'test_helper'

class RoutesTest < ActionDispatch::IntegrationTest
  # Ensure view-only wildcard routes are generated correctly.
  def test_api_routes
    assert_recognizes({controller: 'api', action: 'k5_courses'}, '/dashboardapi/k5_courses')
    assert_recognizes({controller: 'api', action: 'hoc_courses'}, '/api/hoc_courses')
  end
end

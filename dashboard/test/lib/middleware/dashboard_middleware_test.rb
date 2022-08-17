require_relative '../../../../shared/test/common_test_helper'

# this is temporary test designed to evaluate whether requiring common_test_helper
# into dashboard will cause any problems in our test pipeline.
class DashboardMiddlewareTest < Minitest::Test
  def test_dashboard_middleware
    assert true
  end
end

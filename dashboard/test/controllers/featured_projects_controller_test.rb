require 'test_helper'

class FeaturedProjectsControllerTest < ActionDispatch::IntegrationTest
  test "should get new" do
    get featured_projects_new_url
    assert_response :success
  end

end

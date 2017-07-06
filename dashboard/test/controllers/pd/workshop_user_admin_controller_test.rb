require 'test_helper'

class Pd::WorkshopUserAdminControllerTest < ActionDispatch::IntegrationTest
  test "should get facilitator_courses_form" do
    get pd_workshop_user_admin_facilitator_courses_form_url
    assert_response :success
  end
end

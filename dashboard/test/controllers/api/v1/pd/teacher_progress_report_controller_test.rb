require 'test_helper'

class Api::V1::Pd::TeacherProgressReportControllerTest < ::ActionController::TestCase
  test 'admins can view the report' do
    sign_in create(:admin)
    get :index
    assert_response :success
  end

  test 'workshop organizers can view the report' do
    sign_in create(:workshop_organizer)
    get :index
    assert_response :success
  end

  test 'other users cannot view report' do
    sign_in create(:teacher)
    get :index
    assert_response :forbidden
  end
end

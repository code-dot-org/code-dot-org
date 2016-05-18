require 'test_helper'

class Pd::WorkshopDashboardControllerTest < ::ActionController::TestCase
  test 'admins can access the dashboard' do
    sign_in create(:admin)
    get :index
    assert_response :success
  end

  test 'workshop organizers can access the dashboard' do
    sign_in create(:workshop_organizer)
    get :index
    assert_response :success
  end

  test 'facilitators can access the dashboard' do
    sign_in create(:facilitator)
    get :index
    assert_response :success
  end

  test 'normal teachers cannot see the dashboard' do
    sign_in create(:teacher)
    get :index
    assert_response :not_found
  end
end

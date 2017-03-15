require 'test_helper'

class Pd::WorkshopDashboardControllerTest < ::ActionController::TestCase
  test 'admins can access the dashboard' do
    sign_in create(:admin)
    get :index
    assert_response :success
    assert_equal :admin, assigns(:permission)
  end

  test 'workshop organizers can access the dashboard' do
    sign_in create(:workshop_organizer)
    get :index
    assert_response :success
    assert_equal [:workshop_organizer], assigns(:permission)
  end

  test 'facilitators can access the dashboard' do
    sign_in create(:facilitator)
    get :index
    assert_response :success
    assert_equal [:facilitator], assigns(:permission)
  end

  test 'a user who is both a facilitator and an organizer has their permission reflected' do
    user = create(:workshop_organizer)
    user.permission = UserPermission::FACILITATOR

    sign_in user
    get :index
    assert_response :success
    assert_equal [:workshop_organizer, :facilitator], assigns(:permission)
  end

  test 'plps have plp permissions' do
    # PLPs are also organizers
    user = create(:workshop_organizer)
    create :regional_partner, contact: user

    sign_in user
    get :index
    assert_response :success
    assert_equal [:workshop_organizer, :plp], assigns(:permission)
  end

  test 'normal teachers cannot see the dashboard' do
    sign_in create(:teacher)
    get :index
    assert_response :not_found
  end
end

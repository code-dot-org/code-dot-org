require 'test_helper'

class Pd::ApplicationDashboardControllerTest < ::ActionController::TestCase
  test_redirect_to_sign_in_for :index
  test_user_gets_response_for :index, user: :teacher, response: :forbidden

  # TODO: remove this test when workshop_organizer is deprecated
  test_user_gets_response_for(
    :index,
    name: 'Regional Partner program managers as workshop organizers can see the application dashboard',
    user: -> {create :workshop_organizer, :as_regional_partner_program_manager},
    response: :success
  )

  test_user_gets_response_for(
    :index,
    name: 'Regional Partner program managers can see the application dashboard',
    user: -> {create :program_manager},
    response: :success
  )

  test 'Normally does not show assumed identity or environment tags' do
    set_env :production
    sign_in create(:program_manager)
    request.host = "studio.code.org"

    get :index

    assert_select '#environment_tag', {count: 0}
    assert_select '#assumed_identity_tag', {count: 0}
  end

  test 'Assumed identity shows tag' do
    set_env :production
    sign_in create(:program_manager)
    request.host = "studio.code.org"
    session[:assumed_identity] = true

    get :index

    assert_select '#assumed_identity_tag', 'Assumed identity'
  end

  test 'non-prod environment shows tag' do
    sign_in create(:program_manager)
    request.host = "studio.code.org"

    get :index

    assert_select '#environment_tag', 'test'
  end

  test 'Assumed identity on non-prod environment shows combined tag' do
    sign_in create(:program_manager)
    request.host = "studio.code.org"
    session[:assumed_identity] = true

    get :index

    assert_select '#assumed_identity_tag', 'Assumed identity (test)'
  end
end

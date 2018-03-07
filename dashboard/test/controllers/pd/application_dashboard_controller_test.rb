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
end

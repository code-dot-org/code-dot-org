require 'test_helper'

class Pd::WorkshopAdminsControllerTest < ActionController::TestCase
  def self.test_workshop_admin_only(method, action, params = {})
    %i(student teacher facilitator workshop_organizer program_manager).each do |user_type|
      test_user_gets_response_for action, user: user_type, method: method, params: params, response: :forbidden
    end
    test_user_gets_response_for action, user: :workshop_admin, method: method, params: params, response: :success
  end

  test_redirect_to_sign_in_for :directory
  test_workshop_admin_only :get, :directory
end

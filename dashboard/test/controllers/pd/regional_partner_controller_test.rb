require 'test_helper'

class Pd::RegionalPartnerControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @student = create :student
    @teacher = create :teacher
    @facilitator = create :facilitator
    @regional_partner_contact = create(:regional_partner).contact
    @workshop_admin = create :workshop_admin
  end

  def self.test_workshop_admin_only(method, action, params = nil)
    test_user_gets_response_for action, user: :student, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: -> {@teacher}, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: :facilitator, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: -> {@workshop_admin}, method: method, params: params, response: :success
  end

  test_redirect_to_sign_in_for :search
  test_workshop_admin_only :get, :search
end

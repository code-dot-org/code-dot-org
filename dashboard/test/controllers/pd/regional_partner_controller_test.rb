require 'test_helper'

class Pd::RegionalPartnerControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @regional_partner = create :regional_partner
    @workshop_admin = create :workshop_admin
  end

  def self.test_workshop_admin_only(method, action, params = nil)
    test_user_gets_response_for action, user: :student, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: :teacher, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: :facilitator, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: :workshop_organizer, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: -> {@workshop_admin}, method: method, params: params, response: :success
  end

  test_redirect_to_sign_in_for :search
  test_workshop_admin_only :get, :search

  test 'find regional partner for non-existent name displays no results error' do
    sign_in @workshop_admin
    post :search, params: {search_term: 'nonexistent'}
    assert_select '.alert-success', text: 'No matching Regional Partners found. Showing all.'
  end

  test 'find regional partner for non-existent ic displays no results error' do
    sign_in @workshop_admin
    post :search, params: {search_term: -999}
    assert_select '.alert-success', text: 'No matching Regional Partners found. Showing all.'
  end

  test 'find regional partner by id for existing regional partner displays regional partner name' do
    sign_in @workshop_admin
    post :search, params: {search_term: @regional_partner.id}
    assert_select 'td', text: @regional_partner.name
  end

  test 'find regional partner by name for existing regional partner displays regional partner name' do
    sign_in @workshop_admin
    post :search, params: {search_term: @regional_partner.name}
    assert_select 'td', text: @regional_partner.id.to_s
  end
end

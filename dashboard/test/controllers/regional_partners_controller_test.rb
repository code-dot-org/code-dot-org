require 'test_helper'

class RegionalPartnersControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @regional_partner = create :regional_partner
    @workshop_admin = create :workshop_admin
  end

  def self.test_workshop_admin_only(method, action, params = nil)
    %i(student teacher facilitator workshop_organizer).each do |user_type|
      test_user_gets_response_for action, user: user_type, method: method, params: params, response: :forbidden
    end
    test_user_gets_response_for action, user: -> {@workshop_admin}, method: method, params: params, response: :success
  end

  test_redirect_to_sign_in_for :index
  test_workshop_admin_only :get, :index

  test 'find regional partner for non-existent name displays no results error' do
    sign_in @workshop_admin
    post :index, params: {search_term: 'nonexistent'}
    assert_select '.alert-success', text: 'No matching Regional Partners found. Showing all.'
  end

  test 'find regional partner for non-existent id displays no results error' do
    sign_in @workshop_admin
    post :index, params: {search_term: -999}
    assert_select '.alert-success', text: 'No matching Regional Partners found. Showing all.'
  end

  test 'find regional partner by id for existing regional partner displays regional partner name' do
    sign_in @workshop_admin
    post :index, params: {search_term: @regional_partner.id}
    assert_select 'td', text: @regional_partner.name
  end

  test 'find regional partner by name for existing regional partner displays regional partner name' do
    sign_in @workshop_admin
    post :index, params: {search_term: @regional_partner.name}
    assert_select 'td', text: @regional_partner.id.to_s
  end

  test 'create regional partner creates regional partner' do
    sign_in @workshop_admin
    assert_creates RegionalPartner do
      post :create, params: {regional_partner: {name: "Test Regional Partner"}}
    end
    regional_partner = RegionalPartner.last
    assert_redirected_to regional_partner
    assert_equal "Test Regional Partner", regional_partner.name
  end

  test 'create regional partner with invalid fields does not create regional partner' do
    sign_in @workshop_admin
    assert_does_not_create RegionalPartner do
      post :create, params: {regional_partner: {name: "Test Regional Partner", phone_number: "ABC"}}
    end
    assert_template :new
    assert_select '#error_explanation > ul > li', text: 'Phone number is invalid'
  end

  test 'update regional partner updates regional partner' do
    sign_in @workshop_admin
    patch :update, params: {id: @regional_partner.id, regional_partner: {name: 'Updated Name'}}
    assert_equal @regional_partner.reload.name, 'Updated Name'
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'assign workshop organizer as program manager creates regional partner program manager' do
    workshop_organizer = create :workshop_organizer
    sign_in @workshop_admin
    assert_creates RegionalPartnerProgramManager do
      post :assign_program_manager, params: {id: @regional_partner.id, email: workshop_organizer.email}
    end
    assert @regional_partner.program_managers.exists?(workshop_organizer.id)
  end

  test 'assign program manager creates regional partner program manager' do
    teacher = create :teacher
    sign_in @workshop_admin
    assert_creates RegionalPartnerProgramManager do
      post :assign_program_manager, params: {id: @regional_partner.id, email: teacher.email}
    end
    assert @regional_partner.program_managers.exists?(teacher.id)
    assert teacher.program_manager?
  end
end

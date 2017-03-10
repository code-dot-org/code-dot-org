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

  test 'program managers have plp permissions' do
    user = create(:workshop_organizer)
    create :regional_partner_program_manager, program_manager: user

    sign_in user
    get :index
    assert_response :success
    assert_equal [:workshop_organizer, :plp], assigns(:permission)
  end

  test 'available regional partners serializes to just name and id' do
    user = create(:workshop_organizer)
    rp = create :regional_partner, contact: user

    sign_in user
    get :index
    assert_response :success
    assert_equal [{id: rp.id, name: rp.name}], assigns(:available_regional_partners)
  end

  test 'available regional partners includes contacts' do
    user = create(:workshop_organizer)
    regional_partner = create :regional_partner, contact: user

    sign_in user
    get :index
    assert_response :success
    assert_equal [regional_partner.id], assigns(:available_regional_partners).map { |rp| rp[:id] }
  end

  test 'available regional partners includes program managers' do
    user = create(:workshop_organizer)
    regional_partner = create :regional_partner
    create :regional_partner_program_manager, regional_partner: regional_partner, program_manager: user

    sign_in user
    get :index
    assert_response :success
    assert_equal [regional_partner.id], assigns(:available_regional_partners).map { |rp| rp[:id] }
  end

  test 'available regional partners dedupes' do
    user = create(:workshop_organizer)
    regional_partner = create :regional_partner, contact: user
    create :regional_partner_program_manager, regional_partner: regional_partner, program_manager: user

    sign_in user
    get :index
    assert_response :success
    assert_equal [regional_partner.id], assigns(:available_regional_partners).map { |rp| rp[:id] }
  end

  test 'normal teachers cannot see the dashboard' do
    sign_in create(:teacher)
    get :index
    assert_response :not_found
  end
end

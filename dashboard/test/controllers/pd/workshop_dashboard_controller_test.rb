require 'test_helper'

class Pd::WorkshopDashboardControllerTest < ::ActionController::TestCase
  test_user_gets_response_for(
    :index,
    name: 'workshop admins can access the dashboard and get correct permission value',
    user: :workshop_admin
  ) do
    assert_equal :workshop_admin, assigns(:permission)
  end

  [:facilitator, :workshop_organizer, :program_manager].each do |user_type|
    test_user_gets_response_for(
      :index,
      name: "#{user_type.to_s.pluralize} can access the dashboard and get correct permission value",
      user: user_type
    ) do
      assert_equal [user_type], assigns(:permission)
    end
  end

  test 'csf facilitator has permission reflected' do
    user = create :facilitator
    Pd::CourseFacilitator.create(facilitator: user, course: Pd::Workshop::COURSE_CSF)

    sign_in(user)
    get :index
    assert_response :success
    assert_equal [:facilitator, :csf_facilitator], assigns(:permission)
  end

  test 'a user who is both a facilitator and an organizer has their permission reflected' do
    user = create(:workshop_organizer)
    user.permission = UserPermission::FACILITATOR

    sign_in user
    get :index
    assert_response :success
    assert_equal [:workshop_organizer, :facilitator], assigns(:permission)
  end

  test 'a user who is both a program manager and an organizer has their permission reflected' do
    user = create(:workshop_organizer)
    create :regional_partner_program_manager, program_manager: user

    sign_in user
    get :index
    assert_response :success
    assert_equal [:workshop_organizer, :program_manager], assigns(:permission)
  end

  test 'partners have partner permissions' do
    # PLPs are also organizers
    user = create(:workshop_organizer)
    create :regional_partner, contact: user

    sign_in user
    get :index
    assert_response :success
    assert_equal [:workshop_organizer, :partner], assigns(:permission)
  end

  test_user_gets_response_for :index, user: :teacher, response: :not_found
end

require 'test_helper'

class Pd::WorkshopDashboardControllerTest < ::ActionController::TestCase
  test_user_gets_response_for(
    :index,
    name: 'workshop admins can access the dashboard and get correct permission value',
    user: :workshop_admin
  ) do
    assert_equal ['WorkshopAdmin'], permission_list
  end

  [
    [:facilitator, 'Facilitator'],
    [:workshop_organizer, 'Organizer'],
    [:program_manager, 'ProgramManager']
  ].each do |user_type, expected_permission|
    test_user_gets_response_for(
      :index,
      name: "#{user_type.to_s.pluralize} can access the dashboard and get correct permission value",
      user: user_type
    ) do
      assert_equal [expected_permission], permission_list
    end
  end

  test 'csf facilitator has permission reflected' do
    user = create :facilitator
    Pd::CourseFacilitator.create(facilitator: user, course: Pd::Workshop::COURSE_CSF)

    sign_in(user)
    get :index
    assert_response :success
    assert_equal %w(Facilitator CsfFacilitator), permission_list
  end

  test 'a user who is both a facilitator and an organizer has their permission reflected' do
    user = create(:workshop_organizer)
    user.permission = UserPermission::FACILITATOR

    sign_in user
    get :index
    assert_response :success
    assert_equal %w(Organizer Facilitator), permission_list
  end

  test 'a user who is both a program manager and an organizer has their permission reflected' do
    user = create(:workshop_organizer)
    create :regional_partner_program_manager, program_manager: user

    sign_in user
    get :index
    assert_response :success
    assert_equal %w(Organizer ProgramManager), permission_list
  end

  test 'partners have partner permissions' do
    # PLPs are also organizers
    user = create(:workshop_organizer)
    create :regional_partner, contact: user

    sign_in user
    get :index
    assert_response :success
    assert_equal %w(Organizer Partner), permission_list
  end

  test_user_gets_response_for :index, user: :teacher, response: :not_found

  private

  def prop(name)
    JSON.parse(assigns(:script_data).try(:[], :props)).try(:[], name)
  end

  def permission_list
    prop('permissionList')
  end
end

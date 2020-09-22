require 'test_helper'

class HintViewRequestsControllerTest < ActionController::TestCase
  setup do
    HintViewRequest.stubs(:enabled?).returns true
    @student = create :student
  end

  test 'creation requires current_user' do
    post :create, params: {}, format: :json
    assert_response :unauthorized
  end

  test 'creation requires params' do
    sign_in @student
    post :create, params: {}, format: :json
    assert_response :bad_request
  end

  test 'can be created' do
    sign_in @student

    params = {
      script_id: 1,
      level_id: Level.first.id,
      feedback_type: 1,
      feedback_xml: '',
    }

    assert_creates(HintViewRequest) do
      post :create, params: params, format: :json
    end

    assert_response :created
  end

  test 'can be created for pairings' do
    sign_in @student

    section = create(:follower, student_user: @student).section
    classmate_1 = create(:follower, section: section).student_user
    classmate_2 = create(:follower, section: section).student_user
    session[:pairings] = [classmate_1.id, classmate_2.id]
    session[:pairing_section_id] = section.id

    params = {
      script_id: 1,
      level_id: Level.first.id,
      feedback_type: 1,
      feedback_xml: '',
    }

    assert_difference('HintViewRequest.count', 3) do
      post :create, params: params, format: :json
    end

    assert HintViewRequest.where(user_id: @student.id).exists?
    assert HintViewRequest.where(user_id: classmate_1.id).exists?
    assert HintViewRequest.where(user_id: classmate_2.id).exists?

    assert_response :created
  end

  test 'can be disabled' do
    HintViewRequest.stubs(:enabled?).returns false
    sign_in @student

    params = {
      script_id: 1,
      level_id: 1,
      feedback_type: 1,
      feedback_xml: '',
    }

    assert_does_not_create(HintViewRequest) do
      post :create, params: params, format: :json
    end

    assert_response :unauthorized
  end

  test 'creates hints for both users when pairing' do
    driver = create :user
    navigator = create :user
    section = create :section
    section.add_student driver
    section.add_student navigator

    driver_initial = HintViewRequest.where(user: driver).count
    navigator_initial = HintViewRequest.where(user: navigator).count

    sign_in driver
    @controller.send :pairings=, {pairings: [navigator], section_id: section.id}
    post :create, params: {
      script_id: Script.first.id,
      level_id: Script.first.script_levels.first.level,
      feedback_type: 1,
      feedback_xml: 'test_hint',
    }

    driver_final = HintViewRequest.where(user: driver).count
    navigator_final = HintViewRequest.where(user: navigator).count

    assert_equal(1, driver_final - driver_initial)
    assert_equal(1, navigator_final - navigator_initial)
  end
end

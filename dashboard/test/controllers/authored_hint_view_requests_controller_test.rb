require 'test_helper'

class AuthoredHintViewRequestsControllerTest < ActionController::TestCase

  setup do
    AuthoredHintViewRequest.stubs(:enabled?).returns true
    @script = create :script
    @level = create :level
  end

  test 'requires "hints" in params' do
    post :create, {}, format: :json
    assert_response :bad_request
  end

  test 'can create multiple with a single post' do
    initial_count = AuthoredHintViewRequest.count

    post :create, {
      hints: [{
        scriptId: @script.id,
        levelId: @level.id,
        hintId: "first"
      }, {
        scriptId: @script.id,
        levelId: @level.id,
        hintId: "second"
      }]
    }, format: :json

    final_count = AuthoredHintViewRequest.count

    assert_equal(2, final_count - initial_count)
  end

  test 'creates authored hints for both users when pairing' do
    driver = create :user
    navigator = create :user
    section = create :section
    section.add_student driver
    section.add_student navigator

    driver_initial = AuthoredHintViewRequest.where(user: driver).count
    navigator_initial = AuthoredHintViewRequest.where(user: navigator).count

    sign_in driver
    @controller.send :pairings=, [navigator]
    post :create, {
      hints: [{
        scriptId: @script.id,
        levelId: @level.id,
        hintId: 'third'
      }]
    }

    driver_final = AuthoredHintViewRequest.where(user: driver).count
    navigator_final = AuthoredHintViewRequest.where(user: navigator).count

    assert_equal(1, driver_final - driver_initial)
    assert_equal(1, navigator_final - navigator_initial)
  end
end

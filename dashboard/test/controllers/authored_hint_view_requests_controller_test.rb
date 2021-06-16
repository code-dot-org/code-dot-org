require 'test_helper'

class AuthoredHintViewRequestsControllerTest < ActionController::TestCase
  setup do
    AuthoredHintViewRequest.stubs(:enabled?).returns true
    @unit = create :script
    @level = create :level
    @user = create :user
    sign_in @user

    @default_params = {
      hints: [
        {
          scriptId: @unit.id,
          levelId: @level.id,
          hintId: 'hint'
        }
      ]
    }
  end

  test 'requires "hints" in params' do
    post :create, params: {}, format: :json
    assert_response :bad_request
  end

  test 'cannot create without signed-in user' do
    sign_out @user

    assert_does_not_create(AuthoredHintViewRequest) do
      post :create, params: @default_params
    end

    assert_response :unauthorized
  end

  test 'can create multiple with a single post' do
    assert_difference 'AuthoredHintViewRequest.count', 2 do
      post(
        :create,
        params: {
          hints: [
            {
              scriptId: @unit.id,
              levelId: @level.id,
              hintId: "first"
            },
            {
              scriptId: @unit.id,
              levelId: @level.id,
              hintId: "second"
            }
          ]
        },
        format: :json
      )
    end
  end

  test 'creates authored hints for both users when pairing' do
    driver = @user
    navigator = create :user
    section = create :section
    section.add_student driver
    section.add_student navigator

    @controller.send :pairings=, {pairings: [navigator], section_id: section.id}

    assert_difference 'AuthoredHintViewRequest.where(user: driver).count' do
      assert_difference 'AuthoredHintViewRequest.where(user: navigator).count' do
        post :create, params: @default_params
      end
    end
  end

  test 'records all (optional) data fields' do
    data = {
      scriptId: @unit.id,
      levelId: @level.id,
      hintId: 'first',
      hintClass: 'bottom-out',
      hintType: 'general',
      prevTime: 1,
      prevAttempt: 2,
      prevTestResult: 3,
      prevLevelSourceId: 5,
      nextTime: 6,
      nextAttempt: 7,
      nextTestResult: 8,
      nextLevelSourceId: 10,
      finalTime: 11,
      finalAttempt: 12,
      finalTestResult: 13,
      finalLevelSourceId: 15
    }

    post(:create, params: {hints: [data]}, format: :json)

    record = AuthoredHintViewRequest.last

    data.keys.each do |key|
      assert_equal data[key], record[key.to_s.underscore.to_sym]
    end
  end
end

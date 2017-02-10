require 'test_helper'

class AuthoredHintViewRequestsControllerTest < ActionController::TestCase
  setup do
    AuthoredHintViewRequest.stubs(:enabled?).returns true
    @script = create :script
    @level = create :level
    @user = create :user
    sign_in @user

    @default_params = {
      hints: [
        {
          scriptId: @script.id,
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

    # TODO(elijah): Change the implementation, after fixing the client-side, to
    # be :bad_request.
    assert_response :accepted
  end

  test 'can create multiple with a single post' do
    assert_difference 'AuthoredHintViewRequest.count', 2 do
      post(
        :create,
        params: {
          hints: [
            {
              scriptId: @script.id,
              levelId: @level.id,
              hintId: "first"
            },
            {
              scriptId: @script.id,
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

    @controller.send :pairings=, [navigator]

    assert_difference 'AuthoredHintViewRequest.where(user: driver).count' do
      assert_difference 'AuthoredHintViewRequest.where(user: navigator).count' do
        post :create, params: @default_params
      end
    end
  end
end

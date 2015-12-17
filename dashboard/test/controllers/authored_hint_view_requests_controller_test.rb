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

end

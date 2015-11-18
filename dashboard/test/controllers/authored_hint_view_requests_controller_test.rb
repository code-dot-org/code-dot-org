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

    assert_creates(AuthoredHintViewRequest) do
      post :create, {
        hints: [{
          script_id: @script.id,
          level_id: @level.id,
          hint_id: "first"
        }, {
          script_id: @script.id,
          level_id: @level.id,
          hint_id: "second"
        }]
      }, format: :json
    end

    final_count = AuthoredHintViewRequest.count

    assert_equal(final_count - initial_count, 2)
  end

end

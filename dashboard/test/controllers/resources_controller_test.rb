require 'test_helper'

class ResourcesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create :levelbuilder
  end

  test 'can create resource from params' do
    sign_in @levelbuilder
    assert_creates(Resource) do
      post :create, params: {key: 'post-key', name: 'resource name', url: 'code.org'}
      assert_response :success
    end
  end
end

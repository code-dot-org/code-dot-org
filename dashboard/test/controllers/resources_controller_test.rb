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
      post :create, params: {name: 'resource name', url: 'code.org', downloadUrl: 'download.url', type: 'Slides', audience: 'Teacher'}
      assert_response :success
    end
    assert(@response.body.include?('resource name'))
    assert(@response.body.include?('code.org'))
    assert(@response.body.include?('Slides'))
    assert(@response.body.include?('Teacher'))
    assert(@response.body.include?('download.url'))
  end
end

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
      post :create, params: {name: 'resource name', url: 'code.org', download_url: 'download.url', type: 'Slides', audience: 'Teacher'}
      assert_response :success
    end
    assert(@response.body.include?('resource name'))
    assert(@response.body.include?('code.org'))
    assert(@response.body.include?('Slides'))
    assert(@response.body.include?('Teacher'))
    assert(@response.body.include?('download.url'))
  end

  test 'can update resource from params' do
    sign_in @levelbuilder
    resource = create :resource, name: 'original name', type: 'Slides'
    post :update, params: {id: resource.id, name: 'new name'}
    assert_response :success

    # Assert the response has both the new field with the right value
    # and an old unchanged field
    assert(@response.body.include?('new name'))
    assert(@response.body.include?('Slides'))

    resource.reload
    assert_equal 'new name', resource.name
  end
end

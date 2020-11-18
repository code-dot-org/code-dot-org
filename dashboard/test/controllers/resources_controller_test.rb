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

  test 'can create resource with course version' do
    sign_in @levelbuilder
    course_version = create :course_version
    assert_creates(Resource) do
      post :create, params: {name: 'resource name', url: 'code.org', downloadUrl: 'download.url', type: 'Slides', audience: 'Teacher', courseVersionId: course_version.id}
      assert_response :success
    end
    response_resource = JSON.parse(@response.body)
    assert_equal course_version.id, Resource.find_by_key(response_resource["key"]).course_version_id
  end

  test 'resource creation fails with invalid course version' do
    sign_in @levelbuilder
    post :create, params: {name: 'resource name', url: 'code.org', downloadUrl: 'download.url', type: 'Slides', audience: 'Teacher', courseVersionId: -1}
    assert_response 400
    assert @response.body.include? "course version not found"
  end
end

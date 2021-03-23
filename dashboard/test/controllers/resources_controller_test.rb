require 'test_helper'

class ResourcesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create :levelbuilder
    # We don't want to write to the file system here
    Resource.any_instance.stubs(:serialize_scripts)
  end

  test 'can create resource from params' do
    sign_in @levelbuilder
    course_version = create :course_version
    assert_creates(Resource) do
      post :create, params: {name: 'resource name', url: 'code.org', downloadUrl: 'download.url', type: 'Slides', audience: 'Teacher', courseVersionId: course_version.id}
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
    Resource.any_instance.expects(:serialize_scripts).once
    resource = create :resource, name: 'original name', type: 'Slides'
    post :update, params: {id: resource.id, name: 'new name', type: 'Slides'}
    assert_response :success

    # Assert the response has both the new field with the right value
    # and an old unchanged field
    assert(@response.body.include?('new name'))
    assert(@response.body.include?('Slides'))

    resource.reload
    assert_equal 'new name', resource.name
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

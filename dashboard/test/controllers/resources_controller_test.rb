require 'test_helper'

class ResourcesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create :levelbuilder
    File.stubs(:write)
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
    assert_includes(@response.body, 'resource name')
    assert_includes(@response.body, 'code.org')
    assert_includes(@response.body, 'Slides')
    assert_includes(@response.body, 'Teacher')
    assert_includes(@response.body, 'download.url')
  end

  test 'can update resource from params' do
    sign_in @levelbuilder
    Resource.any_instance.expects(:serialize_scripts).once
    resource = create :resource, name: 'original name', type: 'Slides'
    post :update, params: {id: resource.id, name: 'new name', type: 'Slides'}
    assert_response :success

    # Assert the response has both the new field with the right value
    # and an old unchanged field
    assert_includes(@response.body, 'new name')
    assert_includes(@response.body, 'Slides')

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
    assert_includes(@response.body, "course version not found")
  end

  class AuthTests < ActionController::TestCase
    setup do
      course_version = create :course_version
      @resource = create :resource, course_version: course_version
      @new_params = {name: 'name', url: 'code.org', course_version_id: course_version.id}
      @update_params = {id: @resource.id, name: @resource.name, url: 'new.url', course_version_id: course_version.id}
      Resource.any_instance.stubs(:serialize_scripts)
    end

    test_user_gets_response_for :create, params: -> {@new_params}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :create, params: -> {@new_params}, user: :student, response: :forbidden
    test_user_gets_response_for :create, params: -> {@new_params}, user: :teacher, response: :forbidden
    test_user_gets_response_for :create, params: -> {@new_params}, user: :levelbuilder, response: :success

    test_user_gets_response_for :update, params: -> {{id: @resource.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :update, params: -> {@update_params}, user: :student, response: :forbidden
    test_user_gets_response_for :update, params: -> {@update_params}, user: :teacher, response: :forbidden
    test_user_gets_response_for :update, params: -> {@update_params}, user: :levelbuilder, response: :success
  end
end

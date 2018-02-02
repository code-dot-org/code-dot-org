require 'test_helper'

class FeaturedProjectsControllerTest < ActionController::TestCase
  setup do
    @project_validator = create :project_validator
    @featured_project = create :featured_project
    @teacher = create :teacher
  end

  test 'project validators can feature projects' do
    sign_in @project_validator
    @controller.stubs(:storage_decrypt_channel_id).returns([123, 456])
    put :feature, params: {project_id: 456}
    assert_response :success
  end

  test 'project validators can unfeature projects' do
    sign_in @project_validator
    @controller.stubs(:storage_decrypt_channel_id).returns([123, 456])
    put :unfeature, params: {project_id: 456}
    assert_response :success
  end

  test 'users without project validator permission can not feature projects' do
    sign_in @teacher
    @controller.stubs(:storage_decrypt_channel_id).returns([123, 456])
    put :feature, params: {project_id: 456}
    assert_response 403
  end

  test 'users without project validator permission can not unfeature projects' do
    sign_in @teacher
    @controller.stubs(:storage_decrypt_channel_id).returns([123, 456])
    put :unfeature, params: {project_id: 456}
    assert_response 403
  end
end

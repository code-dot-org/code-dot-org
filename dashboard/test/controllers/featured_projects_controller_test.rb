require 'test_helper'

class FeaturedProjectsControllerTest < ActionController::TestCase
  setup do
    @project_validator = create :project_validator
    # @featured_project has a project_id of 456
    @featured_project = create :featured_project
    @teacher = create :teacher
  end

  test 'project validators can bookmark a project as a featured project' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 654])
    put :bookmark, params: {project_id: "789"}
    assert_response :success
  end

  test 'project validators can feature projects' do
    skip 'Investigate flaky test'
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 654])
    put :feature, params: {project_id: "789"}
    assert_response :success
  end

  test 'project validators can unfeature projects' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 456])
    put :unfeature, params: {project_id: "789"}
    assert_response :success
  end

  test 'project validators can delete a featured project' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 456])
    delete :destroy, params: {project_id: "789"}
    assert_response :success
  end

  test 'users without project validator permission can not bookmark a project as a featured project' do
    sign_in @teacher
    put :bookmark, params: {project_id: "789"}
    assert_response 403
  end

  test 'users without project validator permission can not feature projects' do
    sign_in @teacher
    put :feature, params: {project_id: "789"}
    assert_response 403
  end

  test 'users without project validator permission can not unfeature projects' do
    sign_in @teacher
    put :unfeature, params: {project_id: "789"}
    assert_response 403
  end

  test 'users without project validator permission can not delete a featured project' do
    sign_in @teacher
    delete :destroy, params: {project_id: "789"}
    assert_response 403
  end

  test 'bookmarking a never featured project creates a new feature project' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 654])
    assert_creates(FeaturedProject) do
      put :bookmark, params: {project_id: "789"}
    end
    assert FeaturedProject.last.project_id == 654
    assert FeaturedProject.last.unfeatured_at.nil?
    assert FeaturedProject.last.featured_at.nil?
  end

  test 'featuring a currently unfeatured project should update the correct featured project' do
    skip 'Investigate flaky test'
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 456])
    @featured_project.update! unfeatured_at: DateTime.now
    refute @featured_project.reload.active?
    put :feature, params: {project_id: "789"}
    assert @featured_project.reload.active?
  end

  test 'unfeaturing a featured project should unfeature the project' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 456])
    @featured_project.update! featured_at: DateTime.now
    @featured_project.update! unfeatured_at: nil
    assert @featured_project.reload.active?
    put :unfeature, params: {project_id: "789"}
    refute @featured_project.reload.active?
  end
end

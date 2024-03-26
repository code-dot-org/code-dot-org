require 'test_helper'

class FeaturedProjectsControllerTest < ActionController::TestCase
  setup_all do
    @project_validator = create :project_validator
    @project_new = create :project, id: 456, value: {frozen: false, hidden: false, updatedAt: DateTime.now}.to_json
    @project_active = create :project, id: 777, value: {frozen: true, hidden: true, updatedAt: DateTime.now}.to_json
    @project_archived = create :project, id: 888, value: {frozen: false, hidden: false, updatedAt: DateTime.now}.to_json
    # @new_featured_project has a project_id of 456
    @new_featured_project = create :new_featured_project
    # @active_featured_project has a project_id of 777
    @active_featured_project = create :active_featured_project
    # @archived_featured_project has a project_id of 888
    @archived_featured_project = create :archived_featured_project
    @teacher = create :teacher
  end

  test 'project validators can bookmark a project as a featured project' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 456])
    put :bookmark, params: {channel_id: "789"}
    assert_response :success
  end

  test 'project validators can feature projects' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 456])
    put :feature, params: {channel_id: "789"}
    assert_response :success
  end

  test 'project validators can unfeature projects' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 456])
    put :unfeature, params: {channel_id: "789"}
    assert_response :success
  end

  test 'project validators can delete a featured project' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 456])
    delete :destroy, params: {channel_id: "789"}
    assert_response :success
  end

  test 'users without project validator permission can not bookmark a project as a featured project' do
    sign_in @teacher
    put :bookmark, params: {channel_id: "789"}
    assert_response 403
  end

  test 'users without project validator permission can not feature projects' do
    sign_in @teacher
    put :feature, params: {channel_id: "789"}
    assert_response 403
  end

  test 'users without project validator permission can not unfeature projects' do
    sign_in @teacher
    put :unfeature, params: {channel_id: "789"}
    assert_response 403
  end

  test 'users without project validator permission can not delete a featured project' do
    sign_in @teacher
    delete :destroy, params: {channel_id: "789"}
    assert_response 403
  end

  test 'bookmarking a never featured project creates a new featured project' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("678").returns([234, 654])
    assert_creates(FeaturedProject) do
      put :bookmark, params: {channel_id: "678"}
    end
    assert FeaturedProject.last.project_id == 654
    assert FeaturedProject.last.unfeatured_at.nil?
    assert FeaturedProject.last.featured_at.nil?
  end

  test 'featuring a currently unfeatured project should update the correct featured project' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("567").returns([345, 888])
    refute @archived_featured_project.active?
    put :feature, params: {channel_id: "567"}
    assert @archived_featured_project.active? # FAIL
  end

  test 'unfeaturing a featured project should unfeature the project' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("678").returns([987, 777])
    assert @active_featured_project.active?
    put :unfeature, params: {channel_id: "678"}
    refute @active_featured_project.active? # FAIL
  end
end

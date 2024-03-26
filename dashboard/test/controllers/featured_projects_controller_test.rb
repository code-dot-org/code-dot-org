require 'test_helper'

class FeaturedProjectsControllerTest < ActionController::TestCase
  # Setting this to true causes some weird db locking issue, possibly due to
  # some writes to the projects table coming from a different connection via
  # sequel.
  self.use_transactional_test_case = false

  setup_all do
    @project_validator = create :project_validator
    @project = create :project, id: 456, value: {frozen: false, hidden: false, updatedAt: DateTime.now}.to_json
    # @featured_project has a project_id of 456
    @featured_project = create :featured_project
    @teacher = create :teacher
  end

  test 'project validators can bookmark a project as a featured project' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 456])
    put :bookmark, params: {channel_id: "789"}
    assert_response :success
  end

  test 'project validators can feature projects' do
    skip 'Investigate flaky test'
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

  test 'featuring a currently unfeatured project should update the correct featured project' do
    skip 'Investigate flaky test'
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 456])
    @featured_project.update! unfeatured_at: DateTime.now
    refute @featured_project.reload.active?
    put :feature, params: {channel_id: "789"}
    assert @featured_project.reload.active?
  end

  test 'unfeaturing a featured project should unfeature the project' do
    sign_in @project_validator
    @controller.expects(:storage_decrypt_channel_id).with("789").returns([123, 456])
    @featured_project.update! featured_at: DateTime.now
    @featured_project.update! unfeatured_at: nil
    assert @featured_project.reload.active?
    put :unfeature, params: {channel_id: "789"}
    refute @featured_project.reload.active?
  end
end

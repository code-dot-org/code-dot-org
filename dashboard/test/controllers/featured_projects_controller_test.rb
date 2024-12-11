require 'test_helper'

class FeaturedProjectsControllerTest < ActionController::TestCase
  setup_all do
    @project_validator = create :project_validator
    @teacher = create :teacher

    @project_new = create :project, value: {frozen: false, hidden: false, updatedAt: DateTime.now}.to_json
    @project_new_2 = create :project, value: {frozen: false, hidden: false, updatedAt: DateTime.now}.to_json
    @project_active = create :project, value: {frozen: true, hidden: true, updatedAt: DateTime.now}.to_json
    @project_archived = create :project, value: {frozen: false, hidden: false, updatedAt: DateTime.now}.to_json

    @new_featured_project = create :featured_project, project_id: @project_new.id
    @active_featured_project = create :active_featured_project, project_id: @project_active.id
    @archived_featured_project = create :archived_featured_project, project_id: @project_archived.id
  end

  test 'project validators can bookmark a project as a featured project' do
    @controller.stubs(:reset_abuse_score).returns(nil)
    sign_in @project_validator
    put :bookmark, params: {channel_id: @project_new.channel_id}
    assert_response :success
  end

  test 'project validators can feature projects' do
    @controller.stubs(:reset_abuse_score).returns(nil)
    sign_in @project_validator
    put :feature, params: {channel_id: @project_new.channel_id}
    assert_response :success
  end

  test 'project validators can unfeature projects' do
    sign_in @project_validator
    put :unfeature, params: {channel_id: @project_new.channel_id}
    assert_response :success
  end

  test 'project validators can delete a featured project' do
    sign_in @project_validator
    delete :destroy, params: {channel_id: @project_new.channel_id}
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
    @controller.stubs(:reset_abuse_score).returns(nil)
    sign_in @project_validator
    put :bookmark, params: {channel_id: @project_new_2.channel_id}
    assert FeaturedProject.last.project_id == @project_new_2.id
    assert FeaturedProject.last.unfeatured_at.nil?
    assert FeaturedProject.last.featured_at.nil?
  end

  test 'featuring a currently unfeatured project should update the correct featured project' do
    @controller.stubs(:reset_abuse_score).returns(nil)
    sign_in @project_validator
    refute @archived_featured_project.active?
    put :feature, params: {channel_id: @project_archived.channel_id}
    @archived_featured_project.reload
    assert @archived_featured_project.active?
  end

  test 'unfeaturing a featured project should unfeature the project' do
    sign_in @project_validator
    assert @active_featured_project.active?
    put :unfeature, params: {channel_id: @project_active.channel_id}
    @active_featured_project.reload
    refute @active_featured_project.active?
  end
end

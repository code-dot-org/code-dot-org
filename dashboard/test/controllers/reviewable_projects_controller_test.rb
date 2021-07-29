require 'test_helper'

class ReviewableProjectsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @project_owner = create :student
    @project_owner_channel_id = 'encrypted_channel_id'
    @project_level_id = 'level_id'
    @project_script_id = 'script_id'
    @project_owner_storage_id = 123
    @project_storage_app_id = 456

    @teacher = create :teacher
    @section = create :section, user: @teacher
    @another_student = create :student

    create :follower, student_user: @project_owner, section: @section
    create :follower, student_user: @another_student, section: @section
  end

  test 'signed out cannot create ReviewableProject' do
    post :create
    assert_redirected_to_sign_in
  end

  test 'student can mark their own project reviewable' do
    stub_storage_apps_calls

    sign_in @project_owner
    post :create, params: {
      channel_id: @project_owner_channel_id,
      level_id: @project_level_id,
      script_id: @project_script_id
    }

    assert_response :success
  end

  test 'teachers cannot mark student project reviewable' do
    stub_storage_apps_calls

    sign_in @teacher
    post :create, params: {
      channel_id: @project_owner_channel_id,
      level_id: @project_level_id,
      script_id: @project_script_id
    }

    assert_response :forbidden
  end

  test 'other students cannot mark student project reviewable' do
    stub_storage_apps_calls

    sign_in @teacher
    post :create, params: {
      channel_id: @project_owner_channel_id,
      level_id: @project_level_id,
      script_id: @project_script_id
    }

    assert_response :forbidden
  end

  test 'reviewable_status returns correct status for student when own project is not reviewable' do
    stub_storage_apps_calls

    sign_in @project_owner

    get :reviewable_status, params: {
      channel_id: @project_owner_channel_id,
      level_id: @project_level_id,
      script_id: @project_script_id
    }

    assert_response :success

    status = JSON.parse(@response.body)

    assert_not status['reviewEnabled']
    assert status['canMarkReviewable']
  end

  test 'reviewable_status returns correct status for student when own project is reviewable' do
    stub_storage_apps_calls

    sign_in @project_owner

    reviewable_project = create :reviewable_project,
      user_id: @project_owner.id,
      storage_app_id: @project_storage_app_id,
      level_id: @project_level_id,
      script_id: @project_script_id

    get :reviewable_status, params: {
      channel_id: @project_owner_channel_id,
      level_id: @project_level_id,
      script_id: @project_script_id
    }

    assert_response :success

    status = JSON.parse(@response.body)

    assert status['reviewEnabled']
    assert status['canMarkReviewable']
    assert_equal reviewable_project.id, status['id']
  end

  test 'reviewable_status returns correct status for other user when student project is not reviewable' do
    stub_storage_apps_calls

    sign_in @another_student

    get :reviewable_status, params: {
      channel_id: @project_owner_channel_id,
      level_id: @project_level_id,
      script_id: @project_script_id
    }

    assert_response :success

    status = JSON.parse(@response.body)

    assert_not status['reviewEnabled']
    assert_not status['canMarkReviewable']
    assert_nil status['id']
  end

  test 'reviewable_status returns correct status for other user when student project is reviewable' do
    stub_storage_apps_calls

    sign_in @another_student

    create :reviewable_project,
      user_id: @project_owner.id,
      storage_app_id: @project_storage_app_id,
      level_id: @project_level_id,
      script_id: @project_script_id

    get :reviewable_status, params: {
      channel_id: @project_owner_channel_id,
      level_id: @project_level_id,
      script_id: @project_script_id
    }

    assert_response :success

    status = JSON.parse(@response.body)

    assert status['reviewEnabled']
    assert_not status['canMarkReviewable']
    assert_nil status['id']
  end

  test 'students can disable review for their own projects' do
    reviewable_project = create :reviewable_project,
      user_id: @project_owner.id,
      storage_app_id: @project_storage_app_id

    sign_in @project_owner
    delete :destroy, params: {id: reviewable_project.id}

    assert_response :success
  end

  test 'other users cannot disable review for other student projects' do
    reviewable_project = create :reviewable_project,
      user_id: @project_owner.id,
      storage_app_id: @project_storage_app_id

    [@another_student, @teacher].each do |user|
      sign_in user
      delete :destroy, params: {id: reviewable_project.id}

      assert_response :forbidden
    end
  end

  def stub_storage_apps_calls
    ReviewableProjectsController.
      any_instance.
      expects(:storage_decrypt_channel_id).
      with(@project_owner_channel_id).
      returns([@project_owner_storage_id, @project_storage_app_id])
    ReviewableProjectsController.
      any_instance.
      expects(:user_id_for_storage_id).
      with(@project_owner_storage_id).
      returns(@project_owner.id)
  end
end

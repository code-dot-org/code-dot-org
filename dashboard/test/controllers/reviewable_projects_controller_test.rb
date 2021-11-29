require 'test_helper'

class ReviewableProjectsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @project_owner = create :student
    @project_owner_channel_id = 'encrypted_channel_id'
    @project_level_id = 12
    @project_script_id = 34
    @project_owner_storage_id = 56
    @project_storage_app_id = 78

    @teacher = create :teacher

    @section = create :section, user: @teacher, code_review_expires_at: Time.now.utc + 1.day
    @another_student = create :student

    @project_owner_follower = create :follower, student_user: @project_owner, section: @section
    @another_student_follower = create :follower, student_user: @another_student, section: @section
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
    assert_equal @project_owner.short_name, status['name']
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
    assert_equal @project_owner.short_name, status['name']
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
    assert_equal @project_owner.short_name, status['name']
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
    assert_equal @project_owner.short_name, status['name']
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

  test 'student in section with project available for review gets list of peers' do
    # This is default behavior so stub is unnecessary, but adding this
    # so when can search for the DCDO string to clean up
    # we remember to delete this test at that time.
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(false)

    create :reviewable_project,
      user_id: @project_owner.id,
      level_id: @project_level_id,
      script_id: @project_script_id

    sign_in @another_student
    get :for_level, params: {level_id: @project_level_id, script_id: @project_script_id}

    assert_equal [{'id' => @project_owner.id, 'name' => @project_owner.name}], JSON.parse(response.body)
  end

  test 'student does not get projects available for review if project available but not in same section' do
    # This is default behavior so stub is unnecessary, but adding this
    # so when can search for the DCDO string to clean up
    # we remember to delete this test at that time.
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(false)

    student = create :student

    create :reviewable_project,
      user_id: @project_owner.id,
      level_id: @project_level_id,
      script_id: @project_script_id

    sign_in student
    get :for_level, params: {level_id: @project_level_id, script_id: @project_script_id}

    assert_equal [], JSON.parse(response.body)
  end

  test 'student in code review group with project available for review gets list of peers' do
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(true)

    code_review_group = create :code_review_group, section: @section
    create :code_review_group_member, follower: @another_student_follower, code_review_group: code_review_group
    create :code_review_group_member, follower:  @project_owner_follower, code_review_group: code_review_group

    create :reviewable_project,
      user_id: @project_owner.id,
      level_id: @project_level_id,
      script_id: @project_script_id

    sign_in @another_student
    get :for_level, params: {level_id: @project_level_id, script_id: @project_script_id}

    assert_equal [{'id' => @project_owner.id, 'name' => @project_owner.name}], JSON.parse(response.body)
  end

  test 'student in code review group with only own project available for review gets empty list of peers' do
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(true)

    code_review_group = create :code_review_group, section: @section
    create :code_review_group_member, follower: @project_owner_follower, code_review_group: code_review_group

    create :reviewable_project,
      user_id: @project_owner.id,
      level_id: @project_level_id,
      script_id: @project_script_id

    sign_in @project_owner
    get :for_level, params: {level_id: @project_level_id, script_id: @project_script_id}

    assert_equal [], JSON.parse(response.body)
  end

  test 'student not in code review group gets empty list of peers' do
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(true)

    create :reviewable_project,
      user_id: @project_owner.id,
      level_id: @project_level_id,
      script_id: @project_script_id

    sign_in @another_student
    get :for_level, params: {level_id: @project_level_id, script_id: @project_script_id}

    assert_equal [], JSON.parse(response.body)
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

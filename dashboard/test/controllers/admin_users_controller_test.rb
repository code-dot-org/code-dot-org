require 'test_helper'
require 'cdo/activity_constants'

class AdminUsersControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  self.use_transactional_test_case = false

  setup_all do
    @project_owner = create :student
    @project = create :project, owner: @project_owner
  end

  setup do
    @admin = create(:admin)
    @facilitator = create(:facilitator)

    @not_admin = create(:teacher, username: 'notadmin', email: 'not_admin@email.xx')
    @deleted_student = create(:student, username: 'deletedstudent', email: 'deleted_student@email.xx')
    @deleted_student.destroy
    @malformed = create :teacher, email: 'malformed@example.com'
    @malformed.update_column(:email, '')  # Bypasses validation!

    @user = create :user, email: 'test_user@example.com'
    @script = create(:script, :with_levels, levels_count: 3)
    @level = @script.script_levels.first.level  # for tests that only need a single level
    @level1 = @script.script_levels.first.level
    @level2 = @script.script_levels.second.level
    @level3 = @script.script_levels.third.level
    @manual_pass_params = {
      user_id: @user.id,
      script_id_or_name: @script.id,
      level_id: @level.id
    }
  end

  generate_admin_only_tests_for :account_repair_form

  test 'account_repair repairs account' do
    sign_in @admin
    post :account_repair, params: {email: 'malformed@example.com'}
    assert_equal 'malformed@example.com', @malformed.reload.email
  end

  generate_admin_only_tests_for :assume_identity_form

  test "should assume_identity" do
    sign_in @admin

    post :assume_identity, params: {user_id: @not_admin.id}
    assert_redirected_to '/'

    assert_signed_in_as @not_admin
  end

  test "should assume_identity by username" do
    sign_in @admin

    post :assume_identity, params: {user_id: "  " + @not_admin.username + "  "}
    assert_redirected_to '/'

    assert_signed_in_as @not_admin
  end

  test "should assume_identity by email" do
    sign_in @admin

    post :assume_identity, params: {user_id: @not_admin.email}
    assert_redirected_to '/'

    assert_signed_in_as @not_admin
  end

  test "should assume_identity by email not id if email starts with a number" do
    user_with_id = create(:teacher)
    user_with_number_email = create(:teacher, email: "#{user_with_id.id}teacher@email.xx")

    sign_in @admin

    post :assume_identity, params: {user_id: user_with_number_email.email}
    assert_redirected_to '/'

    assert_signed_in_as user_with_number_email # not user_with_id
  end

  test "should assume_identity by hashed email" do
    sign_in @admin

    email = 'someone_under13@somewhere.xx'
    user = create :user, age: 12, email: email

    post :assume_identity, params: {user_id:  email}
    assert_redirected_to '/'

    assert_signed_in_as user
  end

  test "should assume_identity error if not found" do
    sign_in @admin

    post :assume_identity, params: {user_id:  'asdkhaskdj'}

    assert_response :success

    assert_select '.container .alert-danger', 'User not found'
  end

  test "should not assume_identity if not admin" do
    sign_in @not_admin
    post :assume_identity, params: {user_id: @admin.id}
    assert_response :forbidden
    assert_equal @not_admin.id, signed_in_user_id
  end

  test "should not assume_identity if not signed in" do
    sign_out @admin
    post :assume_identity, params: {user_id: @admin.id}

    assert_redirected_to_sign_in
  end

  test "undelete_user should undelete deleted user" do
    sign_in @admin

    post :undelete_user, params: {user_id: @deleted_student.id}

    @deleted_student.reload
    refute @deleted_student.deleted?
  end

  test "undelete_user should noop for normal user" do
    sign_in @admin

    assert_no_difference('@user.reload.updated_at') do
      post :undelete_user, params: {user_id: @user.id}
    end
    refute @user.deleted?
  end

  test "should not undelete_user if not admin" do
    sign_in @not_admin

    assert_no_difference('@deleted_student.reload.updated_at') do
      post :undelete_user, params: {user_id: @deleted_student.id}
    end
    assert_response :forbidden
    assert @deleted_student.deleted?
  end

  generate_admin_only_tests_for :manual_pass_form

  test 'manual_pass adds user_level with manual pass' do
    sign_in @admin

    assert_creates(UserLevel) do
      post :manual_pass, params: @manual_pass_params
    end
    user_level = UserLevel.find_by_user_id(@user.id)
    assert_equal @script.id, user_level.script_id
    assert_equal @level.id, user_level.level_id
    assert_equal ActivityConstants::MANUAL_PASS_RESULT, user_level.best_result
  end

  test 'manual_pass adds user_level with manual pass by script name' do
    sign_in @admin

    assert_creates(UserLevel) do
      post :manual_pass,
        params: @manual_pass_params.merge(script_id_or_name: @script.name)
    end
    user_level = UserLevel.find_by_user_id(@user.id)
    assert_equal @script.id, user_level.script_id
    assert_equal @level.id, user_level.level_id
    assert_equal ActivityConstants::MANUAL_PASS_RESULT, user_level.best_result
  end

  test 'manual_pass modifies with user_level with manual pass' do
    sign_in @admin
    UserLevel.create!(
      user: @user, level: @level, script: @script, best_result: 20
    )

    assert_does_not_create(UserLevel) do
      post :manual_pass, params: @manual_pass_params
    end
    user_level = UserLevel.find_by_user_id(@user.id)
    assert_equal @script.id, user_level.script_id
    assert_equal @level.id, user_level.level_id
    assert_equal ActivityConstants::MANUAL_PASS_RESULT, user_level.best_result
  end

  test 'manual_pass does not overwrite previous perfect' do
    sign_in @admin
    UserLevel.create!(
      user: @user, level: @level, script: @script, best_result: 100
    )

    assert_does_not_create(UserLevel) do
      post :manual_pass, params: @manual_pass_params
    end
    user_level = UserLevel.find_by_user_id(@user.id)
    assert_equal @script.id, user_level.script_id
    assert_equal @level.id, user_level.level_id
    assert_equal 100, user_level.best_result
  end

  test 'manual_pass responds forbidden if not admin' do
    sign_in @not_admin

    assert_does_not_create(UserLevel) do
      post :manual_pass, params: @manual_pass_params
    end
    assert_response :forbidden
  end

  generate_admin_only_tests_for :user_progress_form

  test 'user_progress finds user by id' do
    sign_in @admin
    post :user_progress_form, params: {user_identifier: @not_admin.id.to_s}
    assert_select 'h2', 'User information'
  end

  test 'user_progress finds user by username' do
    sign_in @admin
    post :user_progress_form, params: {user_identifier: @not_admin.username}
    assert_select 'h2', 'User information'
  end

  test 'user_progress finds user by email' do
    sign_in @admin
    post :user_progress_form, params: {user_identifier: @not_admin.email}
    assert_select 'h2', 'User information'
  end

  test 'user_progress shows error for non-existent user' do
    sign_in @admin
    post :user_progress_form, params: {user_identifier: "bogus_name"}
    assert_select '.alert-danger', 'User not found'
  end

  test 'user_progress returns progress' do
    user = @not_admin
    script1 = create(:script, :with_levels, levels_count: 2)
    script2 = create(:script, :with_levels, levels_count: 1)

    UserScript.create!(user: user, script: script1)
    UserScript.create!(user: user, script: script2)

    sign_in @admin
    post :user_progress_form, params: {user_identifier: @not_admin.id.to_s}

    # page has 2 tables:
    # table 1 - user information (1 row)
    # table 2 - script progress (2 rows)
    assert_select "table", 2
    assert_select "table:nth-of-type(1) tbody tr", 1
    assert_select "table:nth-of-type(2) tbody tr", 2
  end

  test "delete_progress_form returns error if not admin" do
    sign_in @not_admin
    get :delete_progress_form, params: {user_id: @user.id, script_id: @script.id}
    assert_response :forbidden
  end

  test 'delete_progress_form returns correct data' do
    sign_in @admin

    UserLevel.create!(user: @user, script: @script, level: @level1, best_result: 0)
    UserLevel.create!(user: @user, script: @script, level: @level2, best_result: 10)
    UserLevel.create!(user: @user, script: @script, level: @level3, best_result: 100)

    get :delete_progress_form, params: {user_id: @user.id, script_id: @script.id}
    assert_response :success
    assert_select "strong" do  |elements|
      assert_equal 4, elements.length
      assert_equal @user.username, elements[1].text
      assert_equal @script.name, elements[2].text
      assert_equal 3, elements[3].text.to_i   # count of user_level rows
    end
  end

  test "delete_progress returns error if not admin" do
    sign_in @not_admin
    post :delete_progress, params: {user_id: @user.id, script_id: @script.id}
    assert_response :forbidden
  end

  test "delete_progress raises error if reason is empty" do
    sign_in @admin
    assert_raises(ActionController::ParameterMissing) do
      post :delete_progress, params: {user_id: @user.id, script_id: @script.id, reason: ''}
    end
  end

  test "delete_progress deletes script progress" do
    sign_in @admin

    UserScript.create!(user: @user, script: @script)
    assert_equal 1, @user.user_scripts.count

    post :delete_progress, params: {user_id: @user.id, script_id: @script.id, reason: 'Testing'}
    @user.reload
    assert_equal 0, @user.user_scripts.count
  end

  test "delete_progress deletes level progress" do
    sign_in @admin

    UserLevel.create!(user: @user, script: @script, level: @level1, best_result: 100)
    UserLevel.create!(user: @user, script: @script, level: @level2, best_result: 50)
    assert_equal 2, @user.user_levels_by_level(@script).count

    post :delete_progress, params: {user_id: @user.id, script_id: @script.id, reason: 'Testing'}
    assert_equal 0, @user.user_levels_by_level(@script).count
  end

  test "delete_progress deletes channel tokens" do
    # TODO: Write this test after the work to add script_ids to channel tokens is completed.
  end

  test "delete_progress deletes teacher feedback" do
    sign_in @admin

    teacher = create(:teacher)
    student = create(:student)
    section = create(:section, teacher: teacher)
    section.add_student(student)

    TeacherFeedback.create!(teacher: teacher, student: student, script: @script, level: @level1)
    TeacherFeedback.create!(teacher: teacher, student: student, script: @script, level: @level1)
    TeacherFeedback.create!(teacher: teacher, student: student, script: @script, level: @level2)
    TeacherFeedback.create!(teacher: teacher, student: student, script: @script, level: @level3)
    assert_equal 3, TeacherFeedback.get_latest_feedbacks_received(student.id, nil, @script.id).count

    post :delete_progress, params: {user_id: student.id, script_id: @script.id, reason: 'Testing'}
    assert_equal 0, TeacherFeedback.get_latest_feedbacks_received(student.id, nil, @script.id).count
  end

  test "delete_progress for driver leaves pairing record" do
    driver = create(:student)
    navigator = create(:student)

    driver_user_level = UserLevel.create!(user: driver, script: @script, level: @level, best_result: 100)
    navigator_user_level = UserLevel.create!(user: navigator, script: @script, level: @level, best_result: 100)
    PairedUserLevel.create!(driver_user_level_id: driver_user_level.id, navigator_user_level_id: navigator_user_level.id)

    # check that we've correctly setup the pairing relationship
    assert navigator_user_level.navigator?
    assert_equal 1, PairedUserLevel.pairs(navigator_user_level).count

    # delete the driver's progress
    post :delete_progress, params: {user_id: driver.id, script_id: @script.id, reason: 'Testing'}

    # navigator should still be able to see that they were paired on this level
    # (but can no longer tell who they were paired with)
    navigator_user_level.reload
    assert navigator_user_level.navigator?
    assert_equal 1, PairedUserLevel.pairs(navigator_user_level).count
  end

  test "delete_progress for navigator leaves pairing record" do
    driver = create(:student)
    navigator = create(:student)

    driver_user_level = UserLevel.create!(user: driver, script: @script, level: @level, best_result: 100)
    navigator_user_level = UserLevel.create!(user: navigator, script: @script, level: @level, best_result: 100)
    PairedUserLevel.create!(driver_user_level_id: driver_user_level.id, navigator_user_level_id: navigator_user_level.id)

    # check that we've correctly setup the pairing relationship
    assert driver_user_level.driver?
    assert_equal 1, PairedUserLevel.pairs(driver_user_level).count

    # delete the navigator's progress
    post :delete_progress, params: {user_id: navigator.id, script_id: @script.id, reason: 'Testing'}

    # driver should still be able to see that they were paired on this level
    # (but can no longer tell who they were paired with)
    driver_user_level.reload
    assert driver_user_level.driver?
    assert_equal 1, PairedUserLevel.pairs(driver_user_level).count
  end

  test "delete_progress deletes code reviews" do
    sign_in @admin

    review1 = create :code_review, user_id: @project_owner.id, script_id: @script.id, level_id: @level1.id, project_id: @project.id
    create :code_review_comment, code_review_id: review1.id

    post :delete_progress, params: {user_id: @project_owner.id, script_id: @script.id, reason: 'Testing'}
    assert_equal 0, CodeReview.where(user_id: @project_owner.id, script_id: @script.id).count
    assert_equal 0, CodeReviewComment.where(code_review_id: review1.id).count
  end

  generate_admin_only_tests_for :user_projects_form

  test 'user_projects finds user by id' do
    sign_in @admin
    post :user_projects_form, params: {user_identifier: @not_admin.id.to_s}
    assert_select 'h2', 'User information'
  end

  test 'user_projects finds user by username' do
    sign_in @admin
    post :user_projects_form, params: {user_identifier: @not_admin.username}
    assert_select 'h2', 'User information'
  end

  test 'user_projects finds user by email' do
    sign_in @admin
    post :user_projects_form, params: {user_identifier: @not_admin.email}
    assert_select 'h2', 'User information'
  end

  test 'user_projects shows error for non-existent user' do
    sign_in @admin
    post :user_projects_form, params: {user_identifier: "bogus_name"}
    assert_select '.alert-danger', 'User not found'
  end

  test 'user_projects returns projects' do
    ProjectsList.stubs(:fetch_personal_projects_for_admin).returns(
      [
        {
          "channel" => "CcBZUYYB_u4BP3kXOpfWow",
          "name" => "My artist project",
          "studentName" => nil,
          "thumbnailUrl" => "/v3/files/CcBZUYYB_u4BP3kXOpfWow/.metadata/thumbnail.png",
          "type" => "artist",
          "updatedAt" => "2022-01-14T15:06:14.990-08:00",
          "publishedAt" => nil,
          "libraryName" => nil,
          "libraryDescription" => nil,
          "libraryPublishedAt" => nil,
          "sharedWith" => []
        }
      ]
    )

    sign_in @admin
    post :user_projects_form, params: {user_identifier: @not_admin.id.to_s}

    # page has 3 tables:
    # table 1 - user information (1 row)
    # table 2 - Projects (1 row)
    # table 3 - Deleted projects (1 rows)
    assert_select "table", 3
    assert_select "table:nth-of-type(1) tbody tr", 1
    assert_select "table:nth-of-type(2) tbody tr", 1
    assert_select "table:nth-of-type(3) tbody tr", 1
  end

  generate_admin_only_tests_for :permissions_form

  test 'find user for non-existent email displays no user error' do
    sign_in @admin
    post :permissions_form, params: {search_term: 'nonexistent@example.net'}
    assert_select '.alert-success', 'User Not Found'
  end

  test 'find user for non-existent id displays no user error' do
    sign_in @admin
    post :permissions_form, params: {search_term: -999}
    assert_select '.alert-success', 'User Not Found'
  end

  test 'find user warns when multiple users have same email address' do
    duplicate_user1 = create :user, email: 'test_duplicate_user1@example.com'
    duplicate_user2 = create :user, email: 'test_duplicate_user2@example.com'
    duplicate_user2.update_column(:email, 'test_duplicate_user1@example.com')
    duplicate_user2.update_column(:hashed_email, User.hash_email('test_duplicate_user1@example.com'))
    sign_in @admin
    post :permissions_form, params: {search_term: 'test_duplicate_user1@example.com'}
    assert_select 'td', text: duplicate_user1.id.to_s
    assert_select(
      '.alert-success',
      "More than one User matches email address.  Showing first result.  " \
      "Matching User IDs - #{duplicate_user1.id},#{duplicate_user2.id}",
    )
  end

  test 'grant_permission grants user_permission' do
    sign_in @admin
    assert_creates UserPermission do
      post :grant_permission, params: {user_id: @not_admin.id, permission: UserPermission::LEVELBUILDER}
    end
    assert_redirected_to permissions_form_path(search_term: @not_admin.id)
    assert @not_admin.reload.permission?(UserPermission::LEVELBUILDER), 'Permission not granted to user'
  end

  test 'grant_permission noops for student user' do
    sign_in @admin
    post(
      :grant_permission,
      params: {user_id: @user.id, permission: UserPermission::LEVELBUILDER}
    )
    assert [], @user.reload.permissions
    assert_redirected_to permissions_form_path(search_term: @user.id)
    assert_equal(
      "FAILED: user #{@user.id} could not be found or is not a teacher",
      flash[:alert]
    )
  end

  test 'revoke_permission revokes user_permission' do
    sign_in @admin
    assert_destroys(UserPermission) do
      get :revoke_permission, params: {user_id: @facilitator.id, permission: UserPermission::FACILITATOR}
    end
    refute @facilitator.reload.permission?(UserPermission::FACILITATOR)
  end

  test 'find users with permission finds users' do
    sign_in @admin
    get :permissions_form, params: {permission: UserPermission::FACILITATOR}
    assert_select 'td', text: @facilitator.id.to_s
  end

  test 'bulk_grant_permission grants multiple user_permissions' do
    sign_in @admin
    teacher = create :teacher
    assert_difference 'UserPermission.count', 2 do
      post :bulk_grant_permission, params: {emails: "#{@not_admin.email}\r\n#{teacher.email}", bulk_permission: UserPermission::LEVELBUILDER}
    end
    assert_redirected_to permissions_form_path
    assert @not_admin.reload.permission?(UserPermission::LEVELBUILDER), 'Permission not granted to user'
    assert teacher.reload.permission?(UserPermission::LEVELBUILDER), 'Permission not granted to user'
    assert_equal(
      "#{UserPermission::LEVELBUILDER.titleize} Permission added for 2 Users",
      flash[:notice]
    )
    assert_nil flash[:alert]
  end

  test 'bulk_grant_permission does not grant user_permissions for student user' do
    sign_in @admin
    student_email = 'student@email.xx'
    student = create :student, email: student_email
    assert_does_not_create UserPermission do
      post :bulk_grant_permission, params: {emails: student_email, bulk_permission: UserPermission::LEVELBUILDER}
    end
    assert_redirected_to permissions_form_path
    refute student.reload.permission?(UserPermission::LEVELBUILDER), 'Permission granted to student'
    assert_equal(
      "FAILED: These Users could not be found or are not teachers: #{student_email}",
      flash[:alert]
    )
    assert_nil flash[:notice]
  end

  test 'bulk_grant_permission only grants user_permission for teachers in mixed list' do
    sign_in @admin
    student_email = 'student@email.xx'
    student = create :student, email: student_email
    assert_difference 'UserPermission.count' do
      post :bulk_grant_permission, params: {emails: "#{@not_admin.email}\r\n#{student_email}", bulk_permission: UserPermission::LEVELBUILDER}
    end
    assert_redirected_to permissions_form_path
    assert @not_admin.reload.permission?(UserPermission::LEVELBUILDER), 'Permission not granted to user'
    refute student.reload.permission?(UserPermission::LEVELBUILDER), 'Permission granted to student'
    assert_equal(
      "#{UserPermission::LEVELBUILDER.titleize} Permission added for 1 User",
      flash[:notice]
    )
    assert_equal(
      "FAILED: These Users could not be found or are not teachers: #{student_email}",
      flash[:alert]
    )
  end

  test 'bulk_grant_permission does not create duplicate permission or error if user already has user_permission' do
    sign_in @admin
    levelbuilder = create :levelbuilder
    assert_does_not_create UserPermission do
      post :bulk_grant_permission, params: {emails: levelbuilder.email, bulk_permission: UserPermission::LEVELBUILDER}
    end
    assert_redirected_to permissions_form_path
    assert levelbuilder.reload.permission?(UserPermission::LEVELBUILDER), 'Permission not granted to user'
    assert_equal(
      "#{UserPermission::LEVELBUILDER.titleize} Permission added for 1 User",
      flash[:notice]
    )
    assert_nil flash[:alert]
  end

  generate_admin_only_tests_for :studio_person_form
end

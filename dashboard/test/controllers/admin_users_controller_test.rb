require 'test_helper'
require 'cdo/activity_constants'

class AdminUsersControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @admin = create(:admin)
    @facilitator = create(:facilitator)

    @not_admin = create(:teacher, username: 'notadmin', email: 'not_admin@email.xx')
    @deleted_student = create(:student, username: 'deletedstudent', email: 'deleted_student@email.xx')
    @deleted_student.destroy
    @malformed = create :teacher, email: 'malformed@example.com'
    @malformed.update_column(:email, '')  # Bypasses validation!

    @user = create :user, email: 'test_user@example.com'
    @script = Script.first
    @level = @script.script_levels.first.level
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

    post :assume_identity, params: {user_id: @not_admin.username}
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
    assert_equal @not_admin.id, session['warden.user.user.key'].first.first # no change
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
    assert_select 'td', duplicate_user1.id.to_s
    assert_select(
      '.alert-success',
      "More than one User matches email address.  Showing first result.  "\
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
    assert_difference 'UserPermission.count', -1 do
      get :revoke_permission, params: {user_id: @facilitator.id, permission: UserPermission::FACILITATOR}
    end
    refute @facilitator.reload.permission?(UserPermission::FACILITATOR)
  end
end

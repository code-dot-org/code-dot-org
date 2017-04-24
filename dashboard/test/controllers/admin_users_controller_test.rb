require 'test_helper'
require 'cdo/activity_constants'

class AdminUsersControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @admin = create(:admin)

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

  test 'grant_permission grants admin status' do
    sign_in @admin
    post :grant_permission, params: {email: @not_admin.email, permission: 'admin'}
    assert @not_admin.reload.admin
  end

  test 'grant_permission grants user_permission' do
    sign_in @admin
    post :grant_permission, params: {email: @not_admin.email, permission: UserPermission::LEVELBUILDER}
    assert [UserPermission::LEVELBUILDER], @not_admin.reload.permissions
  end

  test 'grant_permission noops for student user' do
    sign_in @admin
    post(
      :grant_permission,
      params: {email: 'test_user@example.com', permission: UserPermission::LEVELBUILDER}
    )
    assert [], @user.reload.permissions
    assert_response :redirect
    assert @response.redirect_url.include?('/admin/permissions')
    assert_equal(
      'FAILED: user test_user@example.com could not be found or was not a teacher',
      flash[:alert]
    )
  end

  test 'revoke_all_permissions revokes admin status' do
    sign_in @admin
    post :revoke_all_permissions, params: {email: @admin.email}
    refute @admin.reload.admin
  end

  test 'revoke_all_permissions revokes user permissions' do
    sign_in @admin
    @not_admin.permission = UserPermission::RESET_ABUSE
    @not_admin.permission = UserPermission::PLC_REVIEWER
    post :revoke_all_permissions, params: {email: @not_admin.email}
    assert [], @not_admin.reload.permissions
  end
end

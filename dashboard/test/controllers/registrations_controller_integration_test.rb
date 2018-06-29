require 'test_helper'

class RegistrationsControllerIntegrationTest < ActionDispatch::IntegrationTest
  test "set_email: returns bad_request if user param is nil" do
    student = create(:student)
    sign_in student

    patch '/users/email', params: {}
    assert_response :bad_request
  end

  test "set_email: returns 422 for migrated user with password if user cannot edit password" do
    teacher = create(:teacher, :with_migrated_email_authentication_option)
    sign_in teacher

    User.any_instance.stubs(:can_edit_password?).returns(false)

    patch '/users/email', params: {user: {password: 'newpassword'}}
    assert_response :unprocessable_entity
  end

  test "set_email: returns 422 for migrated user with email if user cannot edit email" do
    teacher = create(:teacher, :with_migrated_email_authentication_option)
    sign_in teacher

    User.any_instance.stubs(:can_edit_email?).returns(false)

    patch '/users/email', params: {user: {email: 'new@email.com'}}
    assert_response :unprocessable_entity
  end

  test "set_email: returns 422 for migrated user with hashed email if user cannot edit email" do
    teacher = create(:teacher, :with_migrated_email_authentication_option)
    sign_in teacher

    User.any_instance.stubs(:can_edit_email?).returns(false)

    patch '/users/email', params: {user: {hashed_email: 'some-hash'}}
    assert_response :unprocessable_entity
  end

  test "set_email: returns 422 for migrated user if password is incorrect" do
    teacher = create(:teacher, :with_migrated_email_authentication_option, password: 'mypassword')
    sign_in teacher

    patch '/users/email', params: {user: {email: 'example@email.com', current_password: 'notmypassword'}}
    assert_response :unprocessable_entity
  end

  test "set_email: updates email for migrated teacher if password is correct" do
    teacher = create(:teacher, :with_migrated_email_authentication_option, password: 'mypassword')
    sign_in teacher

    patch '/users/email', params: {user: {email: 'new@email.com', current_password: 'mypassword'}}
    teacher.reload
    assert_response :success
    assert_equal 'new@email.com', teacher.email
  end

  test "set_email: updates email for migrated student if password is correct" do
    student = create(:student, :with_migrated_email_authentication_option, password: 'mypassword')
    sign_in student

    patch '/users/email', params: {user: {email: 'new@email.com', current_password: 'mypassword'}}
    student.reload
    assert_response :success
    assert_equal User.hash_email('new@email.com'), student.hashed_email
  end

  test "set_email: updates email for migrated teacher without password if password is not required" do
    teacher = create(:teacher, :with_migrated_email_authentication_option, encrypted_password: '')
    sign_in teacher

    patch '/users/email', params: {user: {email: 'new@email.com'}}
    teacher.reload
    assert_response :success
    assert_equal 'new@email.com', teacher.email
  end

  test "set_email: updates email for migrated student without password if password is not required" do
    student = create(:student, :with_migrated_email_authentication_option, encrypted_password: '')
    sign_in student

    hashed_new_email = User.hash_email('new@email.com')
    patch '/users/email', params: {user: {hashed_email: hashed_new_email}}
    student.reload
    assert_response :success
    assert_equal hashed_new_email, student.hashed_email
  end

  test "set_email: updates email for migrated student with plaintext email param if provided" do
    student = create(:student, :with_migrated_email_authentication_option, encrypted_password: '')
    sign_in student

    hashed_other_email = User.hash_email('second@email.com')
    patch '/users/email', params: {user: {email: 'first@email.com', hashed_email: hashed_other_email}}
    student.reload
    assert_response :success
    assert_equal User.hash_email('first@email.com'), student.hashed_email
  end

  test "set_email: returns 422 for non-migrated user with password if user cannot edit password" do
    teacher = create(:teacher, :with_email_authentication_option)
    sign_in teacher

    User.any_instance.stubs(:can_edit_password?).returns(false)

    patch '/users/email', params: {user: {password: 'newpassword'}}
    assert_response :unprocessable_entity
  end

  test "set_email: returns 422 for non-migrated user with email if user cannot edit email" do
    teacher = create(:teacher, :with_email_authentication_option)
    sign_in teacher

    User.any_instance.stubs(:can_edit_email?).returns(false)

    patch '/users/email', params: {user: {email: 'new@email.com'}}
    assert_response :unprocessable_entity
  end

  test "set_email: returns 422 for non-migrated user with hashed email if user cannot edit email" do
    teacher = create(:teacher, :with_email_authentication_option)
    sign_in teacher

    User.any_instance.stubs(:can_edit_email?).returns(false)

    patch '/users/email', params: {user: {hashed_email: 'some-hash'}}
    assert_response :unprocessable_entity
  end

  test "set_email: returns 422 for non-migrated user if password is incorrect" do
    teacher = create(:teacher, :with_email_authentication_option, password: 'mypassword')
    sign_in teacher

    patch '/users/email', params: {user: {email: 'example@email.com', current_password: 'notmypassword'}}
    assert_response :unprocessable_entity
  end

  test "set_email: updates email for non-migrated user if password is correct" do
    teacher = create :teacher, :with_email_authentication_option, password: 'mypassword'
    sign_in teacher

    patch '/users/email', params: {user: {email: 'new@email.com', current_password: 'mypassword'}}
    teacher.reload
    assert_response :success
    assert_equal 'new@email.com', teacher.email
  end

  test "migrate_to_multi_auth fails when signed out" do
    get '/users/migrate_to_multi_auth'
    assert_redirected_to '/users/sign_in'
    assert_equal '/users/migrate_to_multi_auth', session[:user_return_to]
  end

  test "migrate_to_multi_auth migrates an unmigrated user" do
    teacher = create :teacher
    refute teacher.migrated?

    sign_in teacher
    get '/users/migrate_to_multi_auth'
    assert_redirected_to '/home'
    assert_equal 'Multi-auth is now enabled on your account.', flash[:notice]

    teacher.reload
    assert teacher.migrated?
  end

  test "migrate_to_multi_auth is a no-op for a migrated user" do
    teacher = create :teacher, :with_migrated_email_authentication_option
    assert teacher.migrated?

    sign_in teacher
    get '/users/migrate_to_multi_auth'
    assert_redirected_to '/home'
    assert_equal 'Multi-auth is still enabled on your account.', flash[:notice]

    teacher.reload
    assert teacher.migrated?
  end

  test "demigrate_from_multi_auth fails when signed out" do
    get '/users/demigrate_from_multi_auth'
    assert_redirected_to '/users/sign_in'
    assert_equal '/users/demigrate_from_multi_auth', session[:user_return_to]
  end

  test "demigrate_from_multi_auth demigrates a migrated user" do
    teacher = create :teacher, :with_migrated_email_authentication_option
    assert teacher.migrated?

    sign_in teacher
    get '/users/demigrate_from_multi_auth'
    assert_redirected_to '/home'
    assert_equal 'Multi-auth is now disabled on your account.', flash[:notice]

    teacher.reload
    refute teacher.migrated?
  end

  test "demigrate_from_multi_auth is a no-op for an unmigrated user" do
    teacher = create :teacher
    refute teacher.migrated?

    sign_in teacher
    get '/users/demigrate_from_multi_auth'
    assert_redirected_to '/home'
    assert_equal 'Multi-auth is still disabled on your account.', flash[:notice]

    teacher.reload
    refute teacher.migrated?
  end
end

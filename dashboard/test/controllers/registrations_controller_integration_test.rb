require 'test_helper'

class RegistrationsControllerIntegrationTest < ActionDispatch::IntegrationTest
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

require 'test_helper'

class TeacherApplicationHelperTest < ActionView::TestCase
  include TeacherApplicationHelper

  def sign_in(user)
    # override the default sign_in helper because we don't actually have a request or anything here
    stubs(:current_user).returns user
  end

  setup_all do
    @user_with_two_incomplete_apps = create :teacher
    @incomplete_application = create TEACHER_APPLICATION_FACTORY, user: @user_with_two_incomplete_apps, status: 'incomplete'
    create TEACHER_APPLICATION_FACTORY, user: @user_with_two_incomplete_apps, status: 'incomplete', application_year: '2018-2019'

    @user_with_reopened_app = create :teacher
    create TEACHER_APPLICATION_FACTORY, user: @user_with_reopened_app, status: 'reopened'

    @user_with_outdated_incomplete = create :teacher
    create TEACHER_APPLICATION_FACTORY,
      user: @user_with_outdated_incomplete,
      status: 'incomplete',
      application_year: '2018-2019'

    @user_with_outdated_reopened = create :teacher
    create TEACHER_APPLICATION_FACTORY,
      user: @user_with_outdated_reopened,
      status: 'reopened',
      application_year: '2018-2019'
  end

  test 'current application returns user\'s application from this year' do
    sign_in @user_with_two_incomplete_apps
    assert_equal @incomplete_application.id, current_application.id
  end

  test 'current application returns nil if user has no application from this year' do
    sign_in @user_with_outdated_incomplete
    assert_nil current_application
  end

  test "has_incomplete_application" do
    [
      {
        expected_output: true,
        condition_message: 'application exists and is incomplete',
        user: @user_with_two_incomplete_apps
      },
      {
        expected_output: false,
        condition_message: 'application exists and is reopened',
        user: @user_with_reopened_app
      },
      {
        expected_output: false,
        condition_message: 'application is in a different year',
        user: @user_with_outdated_incomplete
      }
    ].each do |expected_output:, user:, condition_message:|
      sign_in user
      assert_equal expected_output, has_incomplete_application?, "expected #{expected_output} when #{condition_message}"
    end
  end

  test "has_reopened_application" do
    [
      {
        expected_output: true,
        condition_message: 'application exists and is reopened',
        user: @user_with_reopened_app
      },
      {
        expected_output: false,
        condition_message: 'application exists and is incomplete',
        user: @user_with_two_incomplete_apps
      },
      {
        expected_output: false,
        condition_message: 'application is in a different year',
        user: @user_with_outdated_reopened
      }
    ].each do |expected_output:, user:, condition_message:|
      sign_in user
      assert_equal expected_output, has_reopened_application?, "expected #{expected_output} when #{condition_message}"
    end
  end
end

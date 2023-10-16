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

    @user_with_incomplete_closed_app = create :teacher
    regional_partner_with_closed_apps = create :regional_partner, apps_close_date_teacher: (Time.zone.today - 3.days).strftime("%Y-%m-%d")
    hash_with_rp_closed_apps = build :pd_teacher_application_hash, regional_partner_id: regional_partner_with_closed_apps.id
    create TEACHER_APPLICATION_FACTORY,
      user: @user_with_incomplete_closed_app,
      status: 'incomplete',
      regional_partner: regional_partner_with_closed_apps,
      form_data_hash: hash_with_rp_closed_apps

    @user_with_incomplete_open_app = create :teacher
    regional_partner_with_open_apps = create :regional_partner, apps_close_date_teacher: (Time.zone.today + 3.days).strftime("%Y-%m-%d")
    hash_with_rp_open_apps = build :pd_teacher_application_hash, regional_partner_id: regional_partner_with_open_apps.id
    create TEACHER_APPLICATION_FACTORY,
      user: @user_with_incomplete_open_app,
      status: 'incomplete',
      form_data_hash: hash_with_rp_open_apps

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

  test "has_incomplete_open_application" do
    [
      {
        expected_output: true,
        condition_message: 'application exists and is incomplete with RP has apps opened',
        user: @user_with_incomplete_open_app
      },
      {
        expected_output: true,
        condition_message: 'application exists and is incomplete with no RP',
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
      },
      {
        expected_output: false,
        condition_message: 'application exists and is incomplete but RP has apps closed',
        user: @user_with_incomplete_closed_app
      }
    ].each do |test_params|
      sign_in test_params[:user]
      assert_equal(
        test_params[:expected_output],
        has_incomplete_open_application?,
        msg: "expected #{test_params[:expected_output]} when #{test_params[:condition_message]}"
      )
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
    ].each do |test_params|
      sign_in test_params[:user]
      assert_equal(
        test_params[:expected_output],
        has_reopened_application?,
        msg: "expected #{test_params[:expected_output]} when #{test_params[:condition_message]}"
      )
    end
  end
end

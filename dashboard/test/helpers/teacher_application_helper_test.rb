require 'test_helper'

class TeacherApplicationHelperTest < ActionView::TestCase
  include TeacherApplicationHelper

  def sign_in(user)
    # override the default sign_in helper because we don't actually have a request or anything here
    stubs(:current_user).returns user
  end

  setup_all do
    # Right now, the status of a newly created application is set to 'unreviewed' in application_base.
    # This will need to change when we allow partial teacher applications to be saved.
    # [MEG] TODO: Can refactor these to avoid an update! call once we change how we set status
    @applicant_with_incomplete_app = create :teacher
    @incomplete_application = create TEACHER_APPLICATION_FACTORY, user: @applicant_with_incomplete_app
    @incomplete_application.update!(status: 'incomplete')

    @applicant_with_unreviewed_app = create :teacher
    @unreviewed_application = create TEACHER_APPLICATION_FACTORY, user: @applicant_with_unreviewed_app

    @teacher_with_not_current_app = create :teacher
    create TEACHER_APPLICATION_FACTORY, user: @teacher_with_not_current_app, application_year: '2018-2019'
  end

  test 'current application returns user\'s application from this year' do
    sign_in @applicant_with_unreviewed_app
    assert_equal @unreviewed_application.id, current_application.id
  end

  test 'current application returns nil if user has no application from this year' do
    sign_in @teacher_with_not_current_app
    assert_nil current_application
  end

  test "has_incomplete_application" do
    [
      {
        expected_output: true,
        condition_message: 'application exists and is incomplete',
        user: @applicant_with_incomplete_app
      },
      {
        expected_output: false,
        condition_message: 'application exists and is unreviewed',
        user: @applicant_with_unreviewed_app
      },
      {
        expected_output: false,
        condition_message: 'application is in a different year',
        user: @teacher_with_not_current_app
      }
    ].each do |expected_output:, user:, condition_message:|
      sign_in user
      assert has_incomplete_application?, "expected true when #{condition_message}" if expected_output
      refute has_incomplete_application?, "expected false when #{condition_message}" unless expected_output
    end
  end
end

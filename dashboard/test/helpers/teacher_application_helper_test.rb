require 'test_helper'

class TeacherApplicationHelperTest < ActionView::TestCase
  include TeacherApplicationHelper

  def sign_in(user)
    # override the default sign_in helper because we don't actually have a request or anything here
    stubs(:current_user).returns user
  end

  setup do
    # Right now, the status of a newly created application is set to 'unreviewed' in application_base.
    # This will need to change when we allow partial teacher applications to be saved.
    # [MEG] TODO: Can refactor these to avoid an update! call once we change how we set status
    @applicant_with_unreviewed_app = create :teacher
    @unreviewed_application = create TEACHER_APPLICATION_FACTORY,
      user: @applicant_with_unreviewed_app

    @applicant_with_incomplete_app = create :teacher
    @incomplete_application = create TEACHER_APPLICATION_FACTORY,
      user: @applicant_with_incomplete_app
    @incomplete_application.update!(status: 'incomplete')

    @teacher_with_not_current_app = create :teacher
    @different_year_application = create TEACHER_APPLICATION_FACTORY,
      user: @teacher_with_not_current_app,
      application_year: '2018-2019'
  end

  test 'current application returns user\'s application from this year' do
    sign_in @applicant_with_unreviewed_app
    assert_equal @unreviewed_application.id, current_application.id
  end

  test 'current application returns nil if user has no application from this year' do
    sign_in @teacher_with_not_current_app
    assert_nil current_application
  end

  test 'has_incomplete_application returns true only if user\'s application exists and is incomplete' do
    sign_in @applicant_with_incomplete_app
    assert has_incomplete_application?

    sign_in @applicant_with_unreviewed_app
    refute has_incomplete_application?

    sign_in @teacher_with_not_current_app
    refute has_incomplete_application?
  end

  test 'has_unreviewed_application returns true only if user\'s application exists and is unreviewed' do
    sign_in @applicant_with_unreviewed_app
    assert has_unreviewed_application?

    sign_in @applicant_with_incomplete_app
    refute has_unreviewed_application?

    sign_in @teacher_with_not_current_app
    refute has_unreviewed_application?
  end
end

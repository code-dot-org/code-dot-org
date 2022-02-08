module TeacherApplicationHelper
  include Pd::Application::ActiveApplicationModels

  # Returns a user's application from the current year, or nil if no application exists.
  # Assumes a user has at most one application in a year.
  def current_application
    TEACHER_APPLICATION_CLASS.
      where(application_year: APPLICATION_CURRENT_YEAR).
      find_by(user: current_user)
  end

  def has_incomplete_application?
    current_application && current_application.status == 'incomplete'
  end
end

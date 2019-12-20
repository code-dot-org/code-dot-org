class TeacherDashboardController < ApplicationController
  load_and_authorize_resource :section

  def show
    @section_summary = @section.summarize
    @sections = current_user.sections.map(&:summarize)
    @valid_grades = Section.valid_grades
  end
end

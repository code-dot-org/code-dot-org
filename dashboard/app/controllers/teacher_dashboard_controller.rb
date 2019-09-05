class TeacherDashboardController < ApplicationController
  load_and_authorize_resource :section

  def show
    @section = @section.summarize
    @sections = current_user.sections.map(&:summarize)
  end
end

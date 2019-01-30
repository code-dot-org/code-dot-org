class TeacherDashboardController < ApplicationController
  def index
    @section = Section.find_by! id: params[:section_id]
    @section = @section.summarize
  end
end

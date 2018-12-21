class TeacherDashboardController < ApplicationController
  def index
    @section_id = params[:section_id]
  end
end

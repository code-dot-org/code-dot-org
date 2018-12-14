class TeacherDashboardController < ApplicationController
  def index
    @tab = params[:tab]
  end
end

class TeacherDashboardController < ApplicationController
  def index
    return head :forbidden unless current_user&.teacher?
    sections = current_user.sections
    section = sections.find(params[:section_id])
    return head :forbidden unless section

    @section = section.summarize
    @all_sections = sections.map(&:summarize)
  end
end

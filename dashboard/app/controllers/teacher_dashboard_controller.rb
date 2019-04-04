class TeacherDashboardController < ApplicationController
  def show
    return head :forbidden unless current_user&.teacher?
    sections = current_user.sections
    section = sections.find_by(id: params[:section_id])
    return head :forbidden unless section

    @section = section.summarize
    @visible_sections = sections.where(hidden: false).map(&:summarize)
  end
end

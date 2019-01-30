class TeacherDashboardController < ApplicationController
  def show
    return head :forbidden unless current_user&.teacher?
    sections = current_user.sections
    section = sections.find_by(id: params[:section_id])
    return head :forbidden unless section

    @section = section.summarize
    @all_sections = sections.map(&:summarize)
  end

  def print_signin_cards
    return head :forbidden unless current_user&.teacher?
    @section = current_user.sections.find_by(id: params[:section_id])
    return head :forbidden unless @section
  end
end

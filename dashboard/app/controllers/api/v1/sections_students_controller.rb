class Api::V1::SectionsStudentsController < ApplicationController
  layout false

  # GET /sections/<section_id>/students
  def index
    return head :forbidden unless current_user

    section = Section.find(params[:section_id])
    authorize! :manage, section

    passing_level_counts = UserLevel.count_passed_levels_for_users(section.students.map(&:id))
    render json: (section.students.map do |student|
      student.summarize.merge(
        completed_levels_count: passing_level_counts[student.id] || 0,
      )
    end)
  end
end

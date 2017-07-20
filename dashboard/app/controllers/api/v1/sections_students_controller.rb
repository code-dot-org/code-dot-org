class Api::V1::SectionsStudentsController < ApplicationController
  load_and_authorize_resource :section
  layout false

  # Don't bother redirecting to login when denying access to the JSON APIs
  rescue_from CanCan::AccessDenied do
    head :forbidden
  end

  # GET /sections/<section_id>/students
  def index
    passing_level_counts = UserLevel.count_passed_levels_for_users(@section.students.map(&:id))
    render json: (@section.students.map do |student|
      student.summarize.merge(
        completed_levels_count: passing_level_counts[student.id] || 0,
      )
    end)
  end
end

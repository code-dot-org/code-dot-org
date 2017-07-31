class Api::V1::SectionsStudentsController < Api::V1::JsonApiController
  load_and_authorize_resource :section

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

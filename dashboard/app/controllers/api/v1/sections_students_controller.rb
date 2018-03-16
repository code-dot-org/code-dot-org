class Api::V1::SectionsStudentsController < Api::V1::JsonApiController
  load_and_authorize_resource :section

  skip_before_action :verify_authenticity_token, only: :update

  # GET /sections/<section_id>/students
  def index
    passing_level_counts = UserLevel.count_passed_levels_for_users(@section.students.pluck(:id))
    render json: (@section.students.map do |student|
      student.summarize.merge(
        completed_levels_count: passing_level_counts[student.id] || 0,
      )
    end)
  end

  # PATCH /sections/<section_id>/student/<id>/update
  def update
    student = @section.students.find_by_id(params[:id])
    return render json: {errors: 'Invalid request'}, status: :bad_request if student.nil?

    if student.update(student_params)
      render json: student.summarize
    else
      render json: {errors: student.errors.full_messages}, status: :bad_request
    end
  end

  def student_params
    params.require(:student).permit(
      :age,
      :gender,
      :name,
      :sharing_disabled,
    )
  end
end

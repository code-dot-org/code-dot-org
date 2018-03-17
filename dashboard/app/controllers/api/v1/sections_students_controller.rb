class Api::V1::SectionsStudentsController < Api::V1::JsonApiController
  load_and_authorize_resource :section

  skip_before_action :verify_authenticity_token, only: [:update, :bulk_add]

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
    return render_404 unless student

    if student.update(student_params)
      render json: student.summarize
    else
      render json: {errors: student.errors.full_messages}, status: :bad_request
    end
  end

  # Used only for picture and word sections
  # POST /sections/<section_id>/students/bulk_add
  def bulk_add
    unless @section.login_type == Section::LOGIN_TYPE_WORD || @section.login_type == Section::LOGIN_TYPE_PICTURE
      return render json: {errors: 'Not a valid section type'}, status: :bad_request
    end

    errors = []
    new_students = []
    ActiveRecord::Base.transaction do
      params[:students].each do |student|
        begin
          new_student = User.create!(
            user_type: User::TYPE_STUDENT,
            provider: User::PROVIDER_SPONSORED,
            name: student["name"],
            age: student["age"],
            gender: student["gender"],
            sharing_disabled: !!student["sharing_disabled"],
          )
          @section.add_student(new_student)
          new_students.push(new_student.summarize)
        rescue ActiveRecord::RecordInvalid => e
          errors << e.message
        end
      end
      raise ActiveRecord::Rollback if errors.any?
    end

    if errors.any?
      render json: {errors: errors}, status: :bad_request
    else
      render json: new_students
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

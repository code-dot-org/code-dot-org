class Api::V1::SectionsStudentsController < Api::V1::JsonApiController
  load_and_authorize_resource :section
  load_resource :student, class: 'User', through: :section, parent: false, only: [:update, :remove]

  skip_before_action :verify_authenticity_token, only: [:update, :bulk_add, :remove]

  # GET /sections/<section_id>/students
  def index
    render json: @section.students.map(&:summarize)
  end

  # PATCH /sections/<section_id>/student/<id>/update
  def update
    return render_404 unless @student

    if @student.update(student_params)
      render json: @student.summarize
    else
      render json: {errors: @student.errors.full_messages}, status: :bad_request
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

  # Remove a student from the section
  # POST /sections/:section_id/students/:id/remove
  def remove
    follower = Follower.where(section: @section.id, student_user_id: @student.id).first
    return render_404 unless @student && follower

    begin
      @section.remove_student(@student, follower, {})
    rescue
      return render json: {errors: @section.errors.full_messages}, status: :bad_request
    end

    render json: {result: 'success'}
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

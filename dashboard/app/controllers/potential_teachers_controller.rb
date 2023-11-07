class PotentialTeachersController < ApplicationController
  before_action :set_potential_teacher, only: [:show]

  # url: /potential_teachers METHOD: POST
  def create
    @potential_teacher = PotentialTeacher.new(potential_teacher_params)
    begin
      @potential_teacher.save!
      render json: {message: 'Potential teacher created successfully'}, status: :created
    rescue ActiveRecord::RecordInvalid => exception
      raise "ERROR: #{exception.message}"
    end
  end

  # GET /potential_teachers/:id
  def show
    @potential_teacher_data = {
      name: @potential_teacher.name,
      email: @potential_teacher.email,
      source_course_offering: @potential_teacher.source_course_offering_id
    }
    render json: @potential_teacher_data
  end

  private def potential_teacher_params
    params.permit(:name, :email, :source_course_offering_id).to_h
  end

  def set_potential_teacher
    @potential_teacher = PotentialTeacher.find_by(id: params[:id])
    return render :not_found unless @potential_teacher
  end
end

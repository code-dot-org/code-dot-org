class PotentialTeachersController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_potential_teacher, only: [:show]

  # url: /potential_teachers METHOD: POST
  def create
    @potential_teacher = PotentialTeacher.new(potential_teacher_params)
    begin
      @potential_teacher.save!
      render json: {message: 'Potential teacher created successfully'}, status: :created
      send_hoc_email(params)
    rescue ActiveRecord::RecordInvalid => exception
      raise "ERROR: #{exception.message}"
    end
  end

  # GET /potential_teachers/:id
  def show
    @potential_teacher_data = {
      name: @potential_teacher.name,
      email: @potential_teacher.email,
      script_id: @potential_teacher.script_id,
      receives_marketing: @potential_teacher.receives_marketing
    }
    render json: @potential_teacher_data
  end

  private def potential_teacher_params
    params.permit([:name, :email, :script_id, :receives_marketing]).to_h
  end

  private def send_hoc_email(params)
    unit_id = params[:script_id]
    lessons = Unit.find_by_id(unit_id).lessons
    lesson_plan_html_url = lessons&.first&.lesson_plan_html_url
    TeacherMailer.hoc_tutorial_email(params[:name], params[:email], lesson_plan_html_url)
  end

  def set_potential_teacher
    @potential_teacher = PotentialTeacher.find_by(id: params[:id])
    return render :not_found unless @potential_teacher
  end
end

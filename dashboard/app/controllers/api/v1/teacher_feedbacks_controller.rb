class Api::V1::TeacherFeedbacksController < Api::V1::JsonApiController
  load_and_authorize_resource

  def show
    @teacher_feedback = TeacherFeedback.find(params[:id])
  end

  # POST /teacher_feedbacks
  # POST /teacher_feedbacks.json
  def create
    @teacher_feedback.teacher_id = current_user.id
    if @teacher_feedback.save
      head :created
    else
      head :bad_request
    end
  end

  private

  # Never trust parameters from the scary internet, only allow the white list through.
  def teacher_feedback_params
    params.require(:teacher_feedback).permit(:student_id, :level_id, :comment, :teacher_id)
  end
end

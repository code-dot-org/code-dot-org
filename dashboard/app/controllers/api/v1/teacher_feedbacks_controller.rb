class Api::V1::TeacherFeedbacksController < Api::V1::JsonApiController
  authorize_resource
  load_resource only: :create

  # Use student_id, level_id, and teacher_id to lookup the feedback for a student on a particular level and provide the
  # most recent feedback left by that teacher
  def show_feedback_from_teacher
    @feedback = TeacherFeedback.where(
      student_id: params[:student_id],
      level_id: params[:level_id],
      teacher_id: params[:teacher_id]
    ).latest
    render json: @feedback
  end

  # Use student_id and level_id to lookup the most recent feedback from each teacher who has provided feedback to that
  # student on that level
  def show_feedback_for_level
    @level_feedbacks = TeacherFeedback.where(
      student_id: params[:student_id],
      level_id: params[:level_id]
    ).latest_per_teacher

    render json: {feedbacks: @level_feedbacks}
  end

  # POST /teacher_feedbacks
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

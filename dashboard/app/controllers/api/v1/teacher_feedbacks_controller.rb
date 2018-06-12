class Api::V1::TeacherFeedbacksController < Api::V1::JsonApiController
  load_and_authorize_resource
  #TODO: (epeach) - Figure out workaround to delete the skip
  skip_before_action :verify_authenticity_token

  def show_feedback_from_teacher
    @feedback = TeacherFeedback.where(student_id: params[:student_id], level_id: params[:level_id], teacher_id: params[:teacher_id]).last
    render json: @feedback
  end

  def show_feedback_for_level
    query = <<-EOS
      SELECT b.*
      FROM (
        SELECT teacher_id, max(created_at) as created_at
        FROM teacher_feedbacks GROUP BY teacher_id) a
      INNER JOIN teacher_feedbacks b ON a.teacher_id = b.teacher_id AND a.created_at = b.created_at
      WHERE b.student_id = #{params[:student_id]} and b.level_id = #{params[:level_id]}
    EOS

    @level_feedbacks = TeacherFeedback.find_by_sql query

    render json: {feedbacks: @level_feedbacks}
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

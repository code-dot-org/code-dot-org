class Api::V1::TeacherFeedbacksController < Api::V1::JsonApiController
  authorize_resource
  load_resource only: :create

  # Use student_id, level_id, and teacher_id to lookup the feedback for a student on a particular level and provide the
  # most recent feedback left by that teacher
  def get_feedback_from_teacher
    @feedback = TeacherFeedback.get_student_level_feedback(
      params.require(:student_id),
      params.require(:level_id),
      params.require(:teacher_id)
    )

    # Setting custom header here allows us to access the csrf-token and manually use for create
    headers['csrf-token'] = form_authenticity_token

    if @feedback.nil?
      head :no_content
    else
      render json: @feedback, serializer: Api::V1::TeacherFeedbackSerializer
    end
  end

  # Use student_id and level_id to lookup the most recent feedback from each teacher who has provided feedback to that
  # student on that level
  def get_feedbacks
    # Setting CSRF token header allows us to access the token manually in subsequent POST requests.
    headers['csrf-token'] = form_authenticity_token

    @level_feedbacks = TeacherFeedback.where(
      student_id: params.require(:student_id),
      level_id: params.require(:level_id)
    ).latest_per_teacher

    render json: @level_feedbacks, each_serializer: Api::V1::TeacherFeedbackSerializer
  end

  # Determine how many not yet seen feedback entries from any verified teacher
  # for any level are associated with the current user
  def count
    # Setting CSRF token header allows us to access the token manually in subsequent POST requests.
    headers['csrf-token'] = form_authenticity_token

    @all_unseen_feedbacks = TeacherFeedback.where(
      student_id: current_user.id,
      seen_on_feedback_page_at: nil,
      student_first_visited_at: nil
    ).select do |feedback|
      User.find(feedback.teacher_id).authorized_teacher?
    end

    render json: @all_unseen_feedbacks.count
  end

  # POST /teacher_feedbacks
  def create
    @teacher_feedback.teacher_id = current_user.id
    if @teacher_feedback.save
      render json: @teacher_feedback, serializer: Api::V1::TeacherFeedbackSerializer, status: :created
    else
      head :bad_request
    end
  end

  # POST /teacher_feedbacks/:id/increment_visit_count
  #
  # Records metrics for student viewing teacher feedback.
  def increment_visit_count
    feedback = TeacherFeedback.find(params[:id])
    if feedback&.increment_visit_count
      head :no_content
    else
      head :unprocessable_entity
    end
  end

  private

  # Never trust parameters from the scary internet, only allow the white list through.
  def teacher_feedback_params
    params.require(:teacher_feedback).permit(:student_id, :level_id, :script_level_id, :comment, :teacher_id, :performance)
  end
end

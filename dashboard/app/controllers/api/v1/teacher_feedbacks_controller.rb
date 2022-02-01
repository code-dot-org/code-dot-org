class Api::V1::TeacherFeedbacksController < Api::V1::JsonApiController
  authorize_resource
  load_resource only: :create

  use_reader_connection_for_route(:get_feedback_from_teacher)

  # Use student_id, level_id, and teacher_id to lookup the feedback for a student on a particular level and provide the
  # most recent feedback left by that teacher
  def get_feedback_from_teacher
    @feedback = TeacherFeedback.get_latest_feedback_given(
      params.require(:student_id),
      params.require(:level_id),
      params.require(:teacher_id),
      params.require(:script_id)
    )

    # Setting custom header here allows us to access the csrf-token and manually use for create
    headers['csrf-token'] = form_authenticity_token

    if @feedback.nil?
      head :no_content
    else
      render json: @feedback.summarize(true)
    end
  end

  use_reader_connection_for_route(:get_feedbacks)

  # Use student_id and level_id to lookup the most recent feedback from each teacher who has provided feedback to that
  # student on that level
  def get_feedbacks
    # Setting CSRF token header allows us to access the token manually in subsequent POST requests.
    headers['csrf-token'] = form_authenticity_token

    @level_feedbacks = TeacherFeedback.get_latest_feedbacks_received(
      params.require(:student_id),
      params.require(:level_id),
      params.require(:script_id)
    ).map {|feedback| feedback.summarize(true)}

    render json: @level_feedbacks
  end

  # Determine how many not yet seen feedback entries from any verified teacher
  # for any level are associated with the current user
  def count
    # Setting CSRF token header allows us to access the token manually in subsequent POST requests.
    headers['csrf-token'] = form_authenticity_token

    count = TeacherFeedback.get_unseen_feedback_count(current_user.id)

    render json: count
  end

  # POST /teacher_feedbacks
  def create
    @teacher_feedback.teacher_id = current_user.id

    if @teacher_feedback.save
      if @teacher_feedback.review_state == TeacherFeedback::REVIEW_STATES.keepWorking
        reset_progress_for_keep_working(@teacher_feedback)
      end

      # reload is called so that the correct created_at date is sent back
      render json: @teacher_feedback.reload.summarize(true), status: :created
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

  def reset_progress_for_keep_working(teacher_feedback)
    UserLevel.update_best_result(
      teacher_feedback.student_id,
      teacher_feedback.level_id,
      teacher_feedback.script_id,
      ActivityConstants::TEACHER_FEEDBACK_KEEP_WORKING,
      false
    )
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def teacher_feedback_params
    params.require(:teacher_feedback).permit(:student_id, :script_id, :level_id, :comment, :teacher_id, :performance, :analytics_section_id, :review_state)
  end
end

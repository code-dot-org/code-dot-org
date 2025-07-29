class Api::V1::TeacherFeedbacksController < Api::V1::JSONApiController
  authorize_resource
  load_resource only: :create

  use_reader_connection_for_route(:get_feedback_from_teacher)

  # Use student_id, level_id, and teacher_id to lookup the feedback for a student on a particular level and provide the
  # most recent feedback left by that teacher
  def get_feedback_from_teacher
    student_id = params.require(:student_id)
    level_id = params.require(:level_id)
    teacher_id = params.require(:teacher_id)
    script_id = params.require(:script_id)

    # Authorization check: ensure the current user can access feedback for this student
    # Students can only access their own feedback
    # Teachers can access feedback for students in their sections
    unless current_user.id == student_id.to_i ||
        (current_user.teacher? && current_user.students.exists?(id: student_id))
      head :forbidden
      return
    end

    @feedback = TeacherFeedback.get_latest_feedback_given(
      student_id,
      level_id,
      teacher_id,
      script_id
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

    student_id = params.require(:student_id)
    level_id = params.require(:level_id)
    script_id = params.require(:script_id)

    # Authorization check: ensure the current user can access feedback for this student
    # Students can only access their own feedback
    # Teachers can access feedback for students in their sections
    unless current_user.id == student_id.to_i ||
        (current_user.teacher? && current_user.students.exists?(id: student_id))
      head :forbidden
      return
    end

    @level_feedbacks = TeacherFeedback.get_latest_feedbacks_received(
      student_id,
      level_id,
      script_id
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

    # Authorization check: ensure the current user can access this feedback
    # Students can only access their own feedback
    # Teachers can access feedback for students in their sections
    unless feedback && (current_user.id == feedback.student_id ||
                       (current_user.teacher? && current_user.students.exists?(id: feedback.student_id)))
      head :forbidden
      return
    end

    if feedback&.increment_visit_count
      head :no_content
    else
      head :unprocessable_entity
    end
  end

  private def reset_progress_for_keep_working(teacher_feedback)
    UserLevel.update_best_result(
      teacher_feedback.student_id,
      teacher_feedback.level_id,
      teacher_feedback.script_id,
      ActivityConstants::TEACHER_FEEDBACK_KEEP_WORKING,
      touch_updated_at: false
    )
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  private def teacher_feedback_params
    params.require(:teacher_feedback).permit(:student_id, :script_id, :level_id, :comment, :teacher_id, :performance, :analytics_section_id, :review_state)
  end
end

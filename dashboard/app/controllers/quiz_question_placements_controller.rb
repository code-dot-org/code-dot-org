# Levelbuilder-only CRUD for one Quiz's placements of bank questions
# :id across every action here is a quiz_question_id, not a
# QuizQuestionPlacement id.
class QuizQuestionPlacementsController < ApplicationController
  include QuizQuestionSerialization

  before_action :authenticate_user!
  before_action :require_levelbuilder_mode_or_test_env
  before_action {@level = Level.find(params[:level_id])}
  before_action {authorize! :manage, @level}
  before_action :require_quiz_level

  # POST /levels/:level_id/quiz_question_placements
  #
  # Creates a MultipleChoiceQuestion and attaches it to this Quiz level.
  # TODO: Implement other question types.
  #
  # All three writes (question, standards, placement) share one transaction.
  # requires_new: true - without this, nesting inside an open transaction (e.g., a test's)
  # just joins it, so a rescued exception here wouldn't actually roll back.
  def create
    question = ActiveRecord::Base.transaction(requires_new: true) do
      question = MultipleChoiceQuestion.create!(
        key: SecureRandom.uuid,
        name: quiz_question_params[:questionName],
        content: {
          stem: quiz_question_params[:stem],
          choices: (quiz_question_params[:choices] || []).map(&:to_h),
          correct_choice_id: quiz_question_params[:correctChoiceId],
        },
        explanation: quiz_question_params[:explanation]
      )
      question.standards = fetch_quiz_question_standards(quiz_question_params[:standards])
      next_position = (@level.placements.maximum(:position) || 0) + 1
      QuizQuestionPlacement.create!(
        level: @level, quiz_question: question,
        page: quiz_question_params[:page].presence || 1, position: next_position
      )
      question
    end

    render status: :created, json: quiz_question_json(question, level: @level)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # POST /levels/:level_id/quiz_question_placements/:id/attach
  #
  # Attaches an existing bank question to this quiz - unlike create, this
  # never creates a new QuizQuestion row, only a new QuizQuestionPlacement.
  # find_or_create_by! makes this idempotent against a double click (adding
  # twice would otherwise be a silent no-op anyway, but this avoids a
  # spurious duplicate row/error).
  def attach
    question = MultipleChoiceQuestion.find(params[:id])
    next_position = (@level.placements.maximum(:position) || 0) + 1
    QuizQuestionPlacement.find_or_create_by!(level: @level, quiz_question: question) do |placement|
      placement.page = 1
      placement.position = next_position
    end

    render status: :created, json: quiz_question_json(question, level: @level)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # DELETE /levels/:level_id/quiz_question_placements/:id/detach
  #
  # Removes the question from this quiz only - destroys the
  # QuizQuestionPlacement, leaves the QuizQuestion itself untouched.
  def detach
    @level.placements.find_by!(quiz_question_id: params[:id]).destroy!

    head :no_content
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  # DELETE /levels/:level_id/quiz_question_placements/:id
  #
  # Removes the question from this quiz AND destroys the QuizQuestion
  # itself, provided nothing else still references it once detached: no
  # other quiz's placement, no QuizQuestionResponse (a past graded
  # attempt), and no other question forked from this one (parent_id).
  # Checked here rather than trusted from the client's earlier
  # attachedToOtherQuizzes read (see quiz_question_json) - a stale read
  # can't accidentally delete a question something else grabbed a
  # reference to in the meantime, so this falls back to a plain detach
  # instead. The whole sequence shares one transaction, so the placement's
  # own removal can't commit ahead of a destroy that then fails - without
  # that, an unanticipated fourth kind of reference would 500 after
  # already detaching, rather than cleanly falling back like the three
  # kinds above.
  def destroy
    placement = @level.placements.find_by!(quiz_question_id: params[:id])
    question = placement.quiz_question

    destroyed = false
    ActiveRecord::Base.transaction(requires_new: true) do
      placement.destroy!
      still_referenced = question.levels.exists? || question.quiz_question_responses.exists?
      unless still_referenced
        question.destroy!
        destroyed = true
      end
    end

    # destroyed tells the caller whether this fell back to a plain detach -
    # QuizQuestionBank needs to know that to decide whether the question
    # should disappear from its results or just remain there, still
    # attachable.
    render json: {destroyed: destroyed}
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  private def require_quiz_level
    head :not_found unless @level.is_a?(Quiz)
  end
end

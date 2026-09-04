# Levelbuilder-only CRUD for one Quiz's placements of bank questions.
# :id is always a quiz_question_id, not a placement id.
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
  # TODO: other question types. requires_new: true - a plain transaction
  # would just join a test's open one and not actually roll back.
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
  # Attaches an existing bank question - no new QuizQuestion row, just a
  # placement. find_or_create_by! makes double-clicking idempotent.
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
  # Destroys the placement only; the question itself is untouched.
  def detach
    @level.placements.find_by!(quiz_question_id: params[:id]).destroy!

    head :no_content
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  # DELETE /levels/:level_id/quiz_question_placements/:id
  #
  # Detaches, then hard-deletes the question too if nothing else
  # references it (other placements, responses, forks) - else falls back
  # to a plain detach. One transaction, so a failed destroy can't leave
  # the placement already gone.
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

    # True unless this fell back to a plain detach.
    render json: {destroyed: destroyed}
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  private def require_quiz_level
    head :not_found unless @level.is_a?(Quiz)
  end
end

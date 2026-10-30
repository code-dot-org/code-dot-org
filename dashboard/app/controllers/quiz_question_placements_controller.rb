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
  # Creates a question of the given type and attaches it to this Quiz level.
  # requires_new: a unit test's own transaction would otherwise absorb this one,
  # so a failed create would leave the question behind instead of rolling back.
  def create
    question = ActiveRecord::Base.transaction(requires_new: true) do
      question_class = quiz_question_class
      question = question_class.create!(
        key: SecureRandom.uuid,
        name: quiz_question_params[:questionName],
        content: question_class.content_from_builder_params(quiz_question_params),
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
    question = QuizQuestion.where(type: QuizQuestion::TYPES).find(params[:id])
    next_position = (@level.placements.maximum(:position) || 0) + 1
    QuizQuestionPlacement.find_or_create_by!(level: @level, quiz_question: question) do |placement|
      placement.page = 1
      placement.position = next_position
    end

    render status: :created, json: quiz_question_json(question, level: @level)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # PUT /levels/:level_id/quiz_question_placements/reorder
  #
  # Renumbers every placement's page and position from 1, in the order given.
  # Must list exactly this quiz's questions; never adds or removes one.
  def reorder
    entries = reorder_params
    placements_by_question_id = @level.placements.index_by(&:quiz_question_id)
    unless entries.pluck(:quiz_question_id).sort == placements_by_question_id.keys.sort
      return render status: :bad_request, json: {error: 'The quiz has changed. Reload and try again.'}
    end

    page_numbers = entries.pluck(:page).uniq.sort.each_with_index.to_h {|page, i| [page, i + 1]}
    last_position_by_page = Hash.new(0)
    ActiveRecord::Base.transaction(requires_new: true) do
      entries.sort_by {|e| [e[:page], e[:position]]}.each do |entry|
        page = page_numbers[entry[:page]]
        # update_columns skips the after_commit that rewrites the .level file per placement.
        placements_by_question_id[entry[:quiz_question_id]].update_columns(
          page: page, position: last_position_by_page[page] += 1, updated_at: Time.now
        )
      end
    end
    # Writes the .level file once for the whole reorder.
    @level.with_lock {@level.save!}

    render json: @level.placements.reload.map {|p| {quizQuestionId: p.quiz_question_id, page: p.page, position: p.position}}
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
      unless question.referenced?
        question.destroy!
        destroyed = true
      end
    end

    # True unless this fell back to a plain detach.
    render json: {destroyed: destroyed}
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  # Raises on a missing or non-integer field, which reorder reports as 400.
  private def reorder_params
    params.fetch(:placements, []).map do |entry|
      {
        quiz_question_id: Integer(entry[:quizQuestionId]),
        page: Integer(entry[:page]),
        position: Integer(entry[:position]),
      }
    end
  end

  private def require_quiz_level
    head :not_found unless @level.is_a?(Quiz)
  end
end

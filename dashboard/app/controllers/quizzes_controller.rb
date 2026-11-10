# Levelbuilder-only endpoint for a Quiz level's own configuration and the
# building view of its placed questions.
class QuizzesController < ApplicationController
  include QuizQuestionSerialization

  before_action :authenticate_user!
  before_action :require_levelbuilder_mode_or_test_env
  before_action {@level = Level.find(params[:level_id])}
  before_action {authorize! :manage, @level}
  before_action {head :not_found unless @level.is_a?(Quiz)}

  # GET /levels/:level_id/quiz_configuration
  #
  # Returns the quiz's configuration and its placed questions for the authoring view.
  def show
    placements = @level.placements.
      includes(quiz_question: {standards: [:framework, {category: :parent_category}]}).to_a
    question_ids = placements.map(&:quiz_question_id)

    question_ids_attached_to_other_quizzes = QuizQuestionPlacement.where(quiz_question_id: question_ids).where.not(level_id: @level.id).
      pluck(:quiz_question_id).to_set
    published_usage = QuizQuestion.published_unit_usage(question_ids)
    answered_ids = answered_question_ids(question_ids)

    render json: quiz_configuration_json(@level).merge(
      version: @level.saved_version,
      usedInPublishedUnit: @level.used_in_published_unit?,
      questions: placements.map do |placement|
        question = placement.quiz_question
        quiz_question_json(
          question,
          level: @level,
          attached_to_other_quizzes: question_ids_attached_to_other_quizzes.include?(question.id),
          used_in_published_unit: published_usage.fetch(question.id, false),
          page: placement.page,
          answered: answered_ids.include?(question.id)
        )
      end
    )
  end

  # PUT/PATCH /levels/:level_id/quiz_configuration
  #
  # Partial update - a key missing from the request leaves that field
  # untouched, rather than clearing it. This matters because the route
  # accepts PATCH as well as PUT, and because the frontend's config tabs
  # each only ever send the fields for their own tab. An explicit null
  # still clears a field.
  #
  # placements (with optional deleteQuestionIds) replaces the quiz's
  # questions. It requires the version from show, and a stale one is
  # refused with 409.
  def update
    # requires_new: a unit test's own transaction would otherwise absorb this
    # one, so a failed save would not roll back.
    @level.with_lock(requires_new: true) do
      if params.key?(:placements)
        raise StaleQuizError unless params[:version].to_s == @level.saved_version.to_s
        @level.replace_placements!(placement_params, delete_question_ids: delete_question_ids_param)
      end
      @level.assign_attributes(present_configuration_updates)
      @level.advance_saved_version
      @level.save!
    end

    json = quiz_configuration_json(@level).merge(version: @level.saved_version)
    if params.key?(:placements)
      json[:placements] = @level.placements.map {|p| {quizQuestionId: p.quiz_question_id, page: p.page, position: p.position}}
    end
    render json: json
  rescue StaleQuizError => exception
    render status: :conflict, json: {error: exception.message}
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  class StaleQuizError < StandardError
    def initialize(msg = 'This quiz was changed somewhere else. Reload to see the latest version.')
      super
    end
  end

  # (wire param => [model attribute, caster]). caster defaults to a plain
  # passthrough - only fields needing a real cast (booleans, and
  # time_limit_minutes - see the serialized_attrs comment) override it.
  CAST_BOOLEAN = ->(v) {ActiveModel::Type::Boolean.new.cast(v)}
  CONFIGURATION_FIELDS = {
    displayName: [:display_name, :itself.to_proc],
    customIntroText: [:custom_intro_text, :itself.to_proc],
    timeLimitMinutes: [:time_limit_minutes, ->(v) {v.presence&.to_i}],
    showCorrectness: [:show_correctness, CAST_BOOLEAN],
    revealAnswerExplanation: [:reveal_answer_explanation, CAST_BOOLEAN],
    showIntroScreen: [:show_intro_screen, CAST_BOOLEAN],
    purpose: [:purpose, :itself.to_proc],
    allowMultipleAttempts: [:allow_multiple_attempts, CAST_BOOLEAN],
    showQuestionsAfterSubmit: [:show_questions_after_submit, CAST_BOOLEAN],
  }.freeze

  # Only includes a key if its wire param was actually present in the
  # request (quiz_configuration_params.key? stays true for an explicit
  # null, so that still clears the field - it's an absent key, not a null
  # value, that's meant to leave a field alone).
  private def present_configuration_updates
    CONFIGURATION_FIELDS.each_with_object({}) do |(wire_key, (attr, caster)), updates|
      next unless quiz_configuration_params.key?(wire_key)
      updates[attr] = caster.call(quiz_configuration_params[wire_key])
    end
  end

  # Raises on a missing or non-integer field, which update reports as 400.
  private def placement_params
    params.fetch(:placements, []).map do |entry|
      {
        quiz_question_id: Integer(entry[:quizQuestionId]),
        page: Integer(entry[:page]),
        position: Integer(entry[:position]),
      }
    end
  end

  private def delete_question_ids_param
    params.fetch(:deleteQuestionIds, []).map {|id| Integer(id)}
  end

  private def quiz_configuration_params
    params.permit(*CONFIGURATION_FIELDS.keys)
  end

  private def quiz_configuration_json(quiz)
    {
      displayName: quiz.display_name,
      customIntroText: quiz.custom_intro_text,
      timeLimitMinutes: quiz.time_limit_minutes,
      showCorrectness: quiz.show_correctness?,
      revealAnswerExplanation: quiz.reveal_answer_explanation?,
      showIntroScreen: quiz.show_intro_screen?,
      purpose: quiz.purpose,
      allowMultipleAttempts: quiz.allow_multiple_attempts?,
      showQuestionsAfterSubmit: quiz.show_questions_after_submit?
    }
  end
end

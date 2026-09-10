# Levelbuilder-only endpoint for a Quiz level's own configuration.
class QuizzesController < ApplicationController
  before_action :authenticate_user!
  before_action :require_levelbuilder_mode_or_test_env
  before_action {@level = Level.find(params[:level_id])}
  before_action {authorize! :manage, @level}
  before_action {head :not_found unless @level.is_a?(Quiz)}

  # PUT/PATCH /levels/:level_id/quiz_configuration
  #
  # Partial update - a key missing from the request leaves that field
  # untouched, rather than clearing it. This matters because the route
  # accepts PATCH as well as PUT, and because the frontend's config tabs
  # each only ever send the fields for their own tab. An explicit null
  # still clears a field.
  def update
    @level.update!(present_configuration_updates)
    render json: quiz_configuration_json(@level)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
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
      allowMultipleAttempts: quiz.allow_multiple_attempts?
    }
  end
end

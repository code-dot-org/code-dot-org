# Levelbuilder-only endpoint for a Quiz level's own configuration.
class QuizzesController < ApplicationController
  before_action :authenticate_user!
  before_action :require_levelbuilder_mode_or_test_env
  before_action {@level = Level.find(params[:level_id])}
  before_action {authorize! :manage, @level}
  before_action {head :not_found unless @level.is_a?(Quiz)}

  # PUT /levels/:level_id/quiz_configuration
  def update
    @level.update!(
      display_name: quiz_configuration_params[:displayName],
      custom_intro_text: quiz_configuration_params[:customIntroText],
      # serialized_attrs getters don't coerce - cast here at the one write path
      # rather than trust the client sent a real Integer.
      time_limit_minutes: quiz_configuration_params[:timeLimitMinutes].presence&.to_i,
      # JSONValue's boolean coercion (behind show_correctness?/
      # reveal_answer_explanation?) checks integral? before boolean?, so
      # always write a real true/false/nil here to avoid ambiguity.
      show_correctness: cast_boolean(quiz_configuration_params[:showCorrectness]),
      reveal_answer_explanation: cast_boolean(quiz_configuration_params[:revealAnswerExplanation]),
      show_intro_screen: cast_boolean(quiz_configuration_params[:showIntroScreen]),
      purpose: quiz_configuration_params[:purpose],
      allow_multiple_attempts: cast_boolean(quiz_configuration_params[:allowMultipleAttempts])
    )
    render json: quiz_configuration_json(@level)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # nil stays nil (param not sent), everything else becomes a real true/false -
  # ActiveModel::Type::Boolean already treats "false"/"0"/0/false as false
  # and anything else present as true, so this is a strict improvement over
  # storing whatever the client sent verbatim.
  private def cast_boolean(value)
    ActiveModel::Type::Boolean.new.cast(value)
  end

  private def quiz_configuration_params
    params.permit(
      :displayName, :customIntroText, :timeLimitMinutes, :showCorrectness,
      :revealAnswerExplanation, :showIntroScreen, :purpose, :allowMultipleAttempts
    )
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

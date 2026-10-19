# A student's progress through an adaptive pathway in one unit. A non-level
# step keeps its progress in user_adaptive_steps; a level step's progress is
# the UserLevel of its level, which milestones record.
class AdaptiveProgressController < ApplicationController
  before_action :authenticate_user!
  before_action :load_adaptive

  rescue_from ActiveRecord::RecordNotFound do
    head :not_found
  end

  # TestResults.LEVEL_STARTED in apps/src/constants.js.
  LEVEL_STARTED_RESULT = -150

  MAX_JSON_BYTES = 64.kilobytes
  MAX_TEXT_LENGTH = 10_000

  # GET /adaptive_progress?scriptId=&levelId=
  def show
    rows = adaptive_user_level&.user_adaptive_steps || []
    steps = rows.filter_map {|row| (entry = row_json(row)) && [row.step_id, entry]}.to_h
    steps.merge!(level_step_progress) {|_step_id, entry, progress| entry.merge(progress)}
    render json: {steps: steps}
  end

  # PUT /adaptive_progress/steps/:step_id/progress
  def update_progress
    body = request.request_parameters
    step = @level.find_step(params[:step_id])
    return head :unprocessable_entity unless step

    # Progress on level-backed steps is in UserLevel; only a skip is recorded here.
    return head :unprocessable_entity if step['kind'] == 'level' && !skip_only?(body)

    if body.key?('answers')
      answers = student_responses(step, body['answers'])
      return head :unprocessable_entity unless answers
    end

    if body.key?('timeSinceLastSave')
      seconds = time_spent_seconds(body['timeSinceLastSave'])
      return head :unprocessable_entity unless seconds
    end

    row = step_row(step)
    row.record_progress!(
      started: body['started'] == true,
      completed: body['completed'] == true,
      skipped: body['skipped'] == true,
      seconds: seconds,
      answers: answers
    )

    render json: row.progress_json
  end

  # PUT /adaptive_progress/steps/:step_id/generated_instructions
  def update_generated_instructions
    step = @level.find_step(params[:step_id])
    # Only a project step with a prompt generates instructions.
    return head :unprocessable_entity unless step && step['kind'] == 'level' && step['project'] == true && step['instructionsPrompt'].present?

    instructions = request.request_parameters['generatedInstructions']
    return head :unprocessable_entity unless valid_json_value?(instructions)

    row = step_row(step)
    row.update!(generated_instructions: instructions)

    render json: row_json(row)
  end

  # PUT /adaptive_progress/steps/:step_id/validation_history
  def update_validation_history
    render json: {error: 'Saving validation history is not implemented yet'}, status: :not_implemented
  end

  private def load_adaptive
    @level = Adaptive.find(params[:levelId])
    @unit = Unit.find(params[:scriptId])
    raise ActiveRecord::RecordNotFound unless @level.script_levels.exists?(script_id: @unit.id)
  end

  private def adaptive_user_level
    UserLevel.find_by(user_id: current_user.id, level_id: @level.id, script_id: @unit.id)
  end

  private def step_row(step)
    user_level = adaptive_user_level || start_adaptive_user_level
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      UserAdaptiveStep.find_or_create_by!(user_level_id: user_level.id, step_id: step['id'])
    end
  end

  # Through the milestone path, so a racing Start milestone finds the same row.
  private def start_adaptive_user_level
    user_level, _ = User.track_level_progress(
      user_id: current_user.id,
      level_id: @level.id,
      script_id: @unit.id,
      new_result: LEVEL_STARTED_RESULT,
      submitted: false,
      level_source_id: nil,
      locale: I18n.locale
    )
    user_level
  end

  # Step id => progress, for each level step the student has a UserLevel on.
  private def level_step_progress
    levels = @level.step_levels
    user_levels = UserLevel.where(user_id: current_user.id, script_id: @unit.id, level_id: levels.values.map(&:id)).index_by(&:level_id)
    levels.filter_map {|step_id, level| [step_id, user_level_json(user_levels[level.id])] if user_levels[level.id]}.to_h
  end

  private def row_json(row)
    return nil unless row.progress || row.generated_instructions
    entry = {'timeSpent' => 0}.merge(row.progress_json)
    entry['generatedInstructions'] = row.generated_instructions if row.generated_instructions
    entry
  end

  private def user_level_json(user_level)
    {
      'status' => user_level.passing? ? 'complete' : 'started',
      'timeSpent' => user_level.time_spent || 0,
    }
  end

  private def valid_json_value?(value)
    (value.is_a?(Hash) || value.is_a?(Array)) && value.to_json.bytesize <= MAX_JSON_BYTES
  end

  private def skip_only?(body)
    body['skipped'] == true && !body.keys.intersect?(%w[started completed timeSinceLastSave answers])
  end

  private def time_spent_seconds(time_ms)
    return nil unless time_ms.is_a?(Numeric) && time_ms >= 0
    [(time_ms / 1000.0).ceil, ActivitiesController::MAX_INT_TIME_SPENT].min
  end

  # {question id => student responses checked against the content}, or nil if they do not fit.
  private def student_responses(step, answers)
    return nil unless answers.is_a?(Hash) && answers['list'].is_a?(Array)
    question_id = answers['questionId'].to_s
    return nil if question_id.empty?
    question = Array(step['questions']).find {|q| q.is_a?(Hash) && q['id'].to_s == question_id}
    return nil unless question

    entries = answers['list']
    return nil unless entries.all?(Hash)
    case question['type']
    when 'MultipleChoiceQuestion'
      choice_ids = Array(question['choices']).map {|choice| choice['id']}
      return nil unless entries.all? {|entry| choice_ids.include?(entry['answerId'])}
      correct_id = question['correctChoiceId']
      list = entries.map {|entry| {'answerId' => entry['answerId'], 'isCorrect' => correct_id && entry['answerId'] == correct_id}.compact}
    when 'freeResponse'
      return nil unless entries.all? {|entry| entry['text'].is_a?(String) && entry['text'].length <= MAX_TEXT_LENGTH}
      list = entries.map {|entry| {'text' => entry['text']}}
    else
      return nil
    end
    {question_id => list}
  end
end

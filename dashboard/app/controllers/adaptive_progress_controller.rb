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

  PROGRESS_FIELDS = %w(started completed timeSinceLastSave answers).freeze
  JSON_FIELDS = {
    'generatedInstructions' => :generated_instructions,
    'validationHistory' => :validation_history,
  }.freeze
  MAX_JSON_BYTES = 64.kilobytes
  MAX_TEXT_LENGTH = 10_000

  # GET /adaptive_progress?scriptId=&levelId=
  def show
    rows = adaptive_user_level&.user_adaptive_steps || []
    steps = rows.filter_map {|row| (entry = row_json(row)) && [row.step_id, entry]}.to_h
    steps.merge!(level_step_progress) {|_step_id, entry, progress| entry.merge(progress)}
    render json: {steps: steps}
  end

  # PUT /adaptive_progress/steps/:step_id
  def update_step
    body = request.request_parameters
    step = @level.find_step(params[:step_id])
    return head :unprocessable_entity unless step

    # Progress on level-backed steps is in UserLevel.
    return head :unprocessable_entity if step['kind'] == 'level' && PROGRESS_FIELDS.any? {|field| body.key?(field)}

    columns = JSON_FIELDS.filter_map {|field, column| [column, body[field]] if body.key?(field)}.to_h
    return head :unprocessable_entity unless columns.values.all? {|value| valid_json_value?(value)}

    if body.key?('answers')
      answers = student_responses(step, body['answers'])
      return head :unprocessable_entity unless answers
    end

    if body.key?('timeSinceLastSave')
      seconds = time_spent_seconds(body['timeSinceLastSave'])
      return head :unprocessable_entity unless seconds
    end

    user_level = adaptive_user_level || start_adaptive_user_level
    row = Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      UserAdaptiveStep.find_or_create_by!(user_level_id: user_level.id, step_id: step['id'])
    end
    row.record_progress!(
      started: body['started'] == true,
      completed: body['completed'] == true,
      seconds: seconds,
      answers: answers,
      columns: columns
    )

    render json: step_json(step, row)
  end

  private def load_adaptive
    @level = Adaptive.find(params[:levelId])
    @unit = Unit.find(params[:scriptId])
    raise ActiveRecord::RecordNotFound unless @level.script_levels.exists?(script_id: @unit.id)
  end

  private def adaptive_user_level
    UserLevel.find_by(user_id: current_user.id, level_id: @level.id, script_id: @unit.id)
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

  # Step id => progress, for each of `levels` the student has a UserLevel on.
  private def level_step_progress(levels = @level.step_levels)
    user_levels = UserLevel.where(user_id: current_user.id, script_id: @unit.id, level_id: levels.values.map(&:id)).index_by(&:level_id)
    levels.filter_map {|step_id, level| [step_id, user_level_json(user_levels[level.id])] if user_levels[level.id]}.to_h
  end

  private def step_json(step, row)
    entry = row_json(row) || {}
    return entry unless step['kind'] == 'level'
    entry.merge(level_step_progress(@level.step_levels.slice(step['id']))[step['id']] || {})
  end

  # A row's progress and generated instructions, or nil when it has neither.
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

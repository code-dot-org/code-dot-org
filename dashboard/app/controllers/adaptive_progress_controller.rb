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
    render json: {steps: steps_json}
  end

  # PUT /adaptive_progress/steps/:step_id
  def update_step
    body = request.request_parameters
    step = @level.find_step(params[:step_id])
    return head :unprocessable_entity unless step

    present = PROGRESS_FIELDS.select {|field| body.key?(field)}
    return head :unprocessable_entity if step['kind'] == 'level' && present.any?

    json_values = JSON_FIELDS.keys.select {|field| body.key?(field)}.index_with {|field| body[field]}
    return head :unprocessable_entity unless json_values.values.all? {|value| valid_json_value?(value)}

    if body.key?('answers')
      question_id, answers = graded_answers(step, body['answers'])
      return head :unprocessable_entity unless answers
    end

    if body.key?('timeSinceLastSave')
      time_ms = body['timeSinceLastSave']
      return head :unprocessable_entity unless time_ms.is_a?(Numeric) && time_ms >= 0
      seconds = [(time_ms / 1000.0).ceil, ActivitiesController::MAX_INT_TIME_SPENT].min
    end

    row = find_or_create_row(adaptive_user_level || start_adaptive_user_level, step['id'])
    row.with_lock do
      JSON_FIELDS.each {|field, column| row[column] = json_values[field] if json_values.key?(field)}
      if present.any?
        progress = row.progress || {}
        now = Time.zone.now.utc.iso8601
        progress['startedAt'] ||= now if body['started'] == true
        progress['completedAt'] ||= now if body['completed'] == true
        progress['timeSpent'] = (progress['timeSpent'] || 0) + seconds if seconds
        if answers
          progress['answers'] = (progress['answers'] || {}).merge(question_id => answers)
          progress['submitted'] = true
        end
        row.progress = progress
      end
      row.save!
    end

    render json: steps_json[step['id']] || {}
  end

  # DELETE /adaptive_progress?scriptId=&levelId=
  #
  # Keeps the adaptive level's UserLevel: the student did start the pathway.
  def destroy
    ActiveRecord::Base.transaction do
      user_level = adaptive_user_level
      UserAdaptiveStep.where(user_level_id: user_level.id).delete_all if user_level
      step_user_levels.destroy_all
    end
    head :no_content
  end

  private def load_adaptive
    @level = Adaptive.find(params[:levelId])
    @unit = Unit.find(params[:scriptId])
    raise ActiveRecord::RecordNotFound unless @level.script_levels.exists?(script_id: @unit.id)
  end

  private def adaptive_user_level
    UserLevel.where(user_id: current_user.id, level_id: @level.id, script_id: @unit.id).first
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

  private def find_or_create_row(user_level, step_id)
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      UserAdaptiveStep.find_or_create_by!(user_level_id: user_level.id, step_id: step_id)
    end
  end

  private def step_user_levels
    UserLevel.where(user_id: current_user.id, script_id: @unit.id, level_id: @level.step_levels.values.map(&:id))
  end

  private def steps_json
    steps = {}
    user_level = adaptive_user_level
    if user_level
      UserAdaptiveStep.where(user_level_id: user_level.id).where.not(progress: nil).find_each do |row|
        progress = row.progress
        steps[row.step_id] = {
          'status' => progress['completedAt'] ? 'complete' : 'started',
          'timeSpent' => progress['timeSpent'] || 0,
        }.merge(progress.slice('startedAt', 'completedAt', 'submitted', 'answers'))
      end
    end

    step_ids_by_level_id = @level.step_levels.to_h {|step_id, level| [level.id, step_id]}
    step_user_levels.each do |step_user_level|
      steps[step_ids_by_level_id[step_user_level.level_id]] = {
        'status' => step_user_level.passing? ? 'complete' : 'started',
        'timeSpent' => step_user_level.time_spent || 0,
      }
    end
    steps
  end

  private def valid_json_value?(value)
    (value.is_a?(Hash) || value.is_a?(Array)) && value.to_json.bytesize <= MAX_JSON_BYTES
  end

  # [question id, answers graded from the content], or nil if they do not fit.
  private def graded_answers(step, answers)
    return nil unless answers.is_a?(Hash) && answers['list'].is_a?(Array)
    question_id = answers['questionId'].to_s
    question = Array(step['questions']).find {|q| q.is_a?(Hash) && q['id'].to_s == question_id}
    return nil unless question

    list = answers['list'].map do |entry|
      return nil unless entry.is_a?(Hash)
      case question['type']
      when 'MultipleChoiceQuestion'
        choice_ids = Array(question['choices']).map {|choice| choice['id']}
        return nil unless choice_ids.include?(entry['answerId'])
        correct_id = question['correctChoiceId']
        correct_id ? {'answerId' => entry['answerId'], 'isCorrect' => entry['answerId'] == correct_id} : {'answerId' => entry['answerId']}
      when 'freeResponse'
        return nil unless entry['text'].is_a?(String) && entry['text'].length <= MAX_TEXT_LENGTH
        {'text' => entry['text']}
      else
        return nil
      end
    end
    [question_id, list]
  end
end

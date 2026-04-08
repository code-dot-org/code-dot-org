require 'cdo/shared_constants'

# Classifies a student's engagement in a lesson into one of 7 profiles based on
# completion and correctness of the levels they worked on.
#
# Profiles:
#   completion: 'all' | 'some' | 'none'
#   correctness: 'all' | 'some' | 'none' | 'na'
#
# Level types that contribute to the profile:
#   Aichat    - complete if UserLevel exists AND ≥1 AichatEvent for (user_id, level_id)
#   FreeResponse - complete if UserLevel with non-blank LevelSource#data;
#                  correct if StudentWorkEvaluation is ALL_COMPLETE_CORRECT or
#                  PARTIAL_COMPLETE_CORRECT (creating one via OpenAI if not yet present)
#
# Level types that are excluded (Panels, Music, ExternalLink, Assessment):
#   No reliable completion or correctness signal available.
class LessonStudentProfiler
  CORRECT_EVALUATIONS = [
    SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT],
    SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT],
  ].freeze

  def initialize(lesson, user)
    @lesson = lesson
    @user = user
    @unit = lesson.script
  end

  # Returns a hash: { completion: String, correctness: String }
  def call
    completable_levels = []
    correctable_levels = []
    completed_count = 0
    correct_count = 0

    @lesson.script_levels.each do |script_level|
      level = script_level.level

      case level
      when Aichat
        completable_levels << level
        completed_count += 1 if aichat_complete?(level)
      when FreeResponse
        user_level = user_level_for(level)
        completable_levels << level
        if free_response_complete?(user_level)
          completed_count += 1
          correctable_levels << level
          correct_count += 1 if free_response_correct?(level, user_level)
        end
      end
      # Panels, Music, ExternalLink, Assessment: excluded — no reliable signal
    end

    {
      completion: classify(completed_count, completable_levels.size),
      correctness: correctable_levels.empty? ? 'na' : classify(correct_count, correctable_levels.size),
    }
  end

  private

  def user_level_for(level)
    UserLevel.find_by(user: @user, level: level, script: @unit)
  end

  def aichat_complete?(level)
    return false unless user_level_for(level)
    AichatEvent.where(user_id: @user.id, level_id: level.id).exists?
  end

  def free_response_complete?(user_level)
    return false unless user_level&.level_source_id
    user_level.level_source&.data.present?
  end

  def free_response_correct?(level, user_level)
    evaluation = StudentWorkEvaluation.find_by(
      type: 'UserLevelEvaluation',
      student_id: @user.id,
      level_id: level.id,
      unit_id: @unit.id
    )

    evaluation ||= create_free_response_evaluation(level, user_level)

    evaluation && CORRECT_EVALUATIONS.include?(evaluation.evaluation)
  end

  # Calls the OpenAI evaluation helper directly (avoids HTTP round-trip) and
  # persists a new StudentWorkEvaluation. Returns nil if evaluation fails.
  def create_free_response_evaluation(level, user_level)
    student_work = user_level.level_source.data

    response = OpenaiEvaluateHelper.evaluate(
      level,
      student_work: student_work,
      evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]
    )

    return nil unless response[:status] == :ok || response[:status] == 200

    parsed = JSON.parse(response[:json]['content'])

    StudentWorkEvaluation.create!(
      type: 'UserLevelEvaluation',
      student_id: @user.id,
      level_id: level.id,
      unit_id: @unit.id,
      evaluator: 'AI',
      evaluation_criteria: parsed['evaluationCriteria'],
      evaluation: parsed['aiEvaluation'],
      reasoning: parsed['aiReasoning'],
      requester_id: nil,
      school_year: '2024-25',
      ai_model_version: SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION
    )
  rescue => e
    Rails.logger.error("LessonStudentProfiler: failed to evaluate level #{level.id} for user #{@user.id}: #{e.message}")
    nil
  end

  def classify(count, total)
    return 'none' if count == 0
    return 'all' if count == total
    'some'
  end
end

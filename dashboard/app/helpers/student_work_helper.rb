# The Student Work Helper module provides methods for retrieving and
# evaluating student work.
module StudentWorkHelper
  # Returns attempt, correctness, question text, and student response data per
  # assessment question for a student in a given lesson.
  #
  # For free response levels, uses an existing UserLevelEvaluation when one is
  # present; otherwise calls OpenaiEvaluateHelper.evaluate_free_response to
  # create one (skipped when the student has no submission).
  #
  # @param lesson_id [Integer]
  # @param student_id [Integer]
  # @return [Array<Hash>] one entry per assessment level, each containing:
  #   - :level_id        [Integer]
  #   - :script_level_id [Integer]
  #   - :attempts        [Integer]  total submissions (0 if none)
  #   - :correct         [Boolean]  passing result, or all_complete_correct for free response
  #   - :question_text   [String, nil]  the question prompt shown to the student
  #   - :student_response [String, nil]  the student's answer, nil if no attempt
  #   - :evaluation      [String, nil]  AI evaluation string; present only for free response levels
  def lesson_assessment_analysis(lesson_id, student_id)
    lesson = Lesson.find(lesson_id)
    assessment_script_levels = lesson.script_levels.
      where(assessment: true).
      includes(:levels)

    top_level_ids = assessment_script_levels.flat_map(&:level_ids)

    # Collect sublevels from any LevelGroups so we can batch-query their
    # UserLevel and UserLevelEvaluation records in one shot.
    sublevel_map = {}  # level_group_id => [sublevels]
    assessment_script_levels.flat_map(&:levels).each do |level|
      next unless level.is_a?(LevelGroup)
      sublevel_map[level.id] = level.levels
    end
    sublevel_ids = sublevel_map.values.flatten.map(&:id)
    all_level_ids = top_level_ids + sublevel_ids

    user_levels = UserLevel.
      where(user_id: student_id, level_id: all_level_ids, script: lesson.script).
      includes(:level_source).
      index_by(&:level_id)

    evaluations = UserLevelEvaluation.
      where(student_id: student_id, level_id: all_level_ids, unit_id: lesson.script_id).
      index_by(&:level_id)

    assessment_script_levels.flat_map do |sl|
      sl.levels.flat_map do |level|
        sublevels = sublevel_map[level.id]
        levels_to_process = sublevels || [level]

        levels_to_process.map do |sublevel|
          ul = user_levels[sublevel.id]
          result = {
            level_id: sublevel.id,
            script_level_id: sl.id,
            attempts: ul&.attempts || 0,
            correct: ul&.passing? || false,
            question_text: question_text_for_level(sublevel),
            student_response: AiSystemPrompts::StudentSnapshotPromptHelper.get_student_response(ul, sublevel),
          }

          if sublevel.is_a?(FreeResponse)
            evaluation = evaluations[sublevel.id]

            if evaluation.nil? && ul&.level_source&.data.present?
              OpenaiEvaluateHelper.evaluate_free_response(ul, lesson.script)
              evaluation = UserLevelEvaluation.find_by(
                student_id: student_id,
                level_id: sublevel.id,
                unit_id: lesson.script_id
              )
            end

            result[:evaluation] = evaluation&.evaluation
            result[:correct] = evaluation&.evaluation == SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT]
            result[:aiReasoning] = evaluation&.reasoning
          end

          result
        end
      end
    end
  end

  private def question_text_for_level(level)
    case level
    when FreeResponse
      level.long_instructions
    when Multi
      level.get_question_text
    end
  end
end

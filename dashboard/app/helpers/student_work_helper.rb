module StudentWorkHelper
  # Returns attempt and correctness data per assessment question for a student
  # in a given lesson.
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
  #   - :evaluation      [String, nil]  AI evaluation string; present only for free response levels
  def lesson_assessment_analysis(lesson_id, student_id)
    lesson = Lesson.find(lesson_id)
    assessment_script_levels = lesson.script_levels.
      where(assessment: true).
      includes(:levels)

    level_ids = assessment_script_levels.flat_map(&:level_ids)

    user_levels = UserLevel.
      where(user_id: student_id, level_id: level_ids, script: lesson.script).
      includes(:level_source).
      index_by(&:level_id)

    evaluations = UserLevelEvaluation.
      where(student_id: student_id, level_id: level_ids, unit_id: lesson.script_id).
      index_by(&:level_id)

    assessment_script_levels.flat_map do |sl|
      sl.levels.map do |level|
        ul = user_levels[level.id]
        result = {
          level_id: level.id,
          script_level_id: sl.id,
          attempts: ul&.attempts || 0,
          correct: ul&.passing? || false,
        }

        if level.is_a?(FreeResponse)
          evaluation = evaluations[level.id]

          if evaluation.nil? && ul&.level_source&.data.present?
            OpenaiEvaluateHelper.evaluate_free_response(ul, lesson.script)
            evaluation = UserLevelEvaluation.find_by(
              student_id: student_id,
              level_id: level.id,
              unit_id: lesson.script_id
            )
          end

          result[:evaluation] = evaluation&.evaluation
          result[:correct] = evaluation&.evaluation == SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT]
        end

        result
      end
    end
  end
end

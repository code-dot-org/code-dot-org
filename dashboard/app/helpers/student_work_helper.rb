# The Student Work Helper module provides methods for retrieving and
# evaluating work a student completed within a lesson.
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

  # Returns counts of levels attempted and correct for
  # a student's progress across all levels in a lesson.
  #
  # Attempt and correctness rules per level type:
  #   Multi    — attempted: any attempt; correct: passing (best_result >= 20)
  #   External — attempted: any attempt; correct: same as attempted
  #   Aichat   — attempted: UserLevel exists AND at least one AichatEvent exists; correct: same as attempted
  #   BubbleChoice — attempted: any sublevel attempted; correct: any sublevel passing
  #   LevelGroup — attempted: any sublevel attempted;
  #                correct: all attempted sublevels correct
  #     (Multi sublevel → passing; FreeResponse sublevel → ALL_COMPLETE_CORRECT
  #      evaluation; evaluation triggered if absent but submission exists)
  #
  # A level is "validated" when its correctness is meaningfully distinct from
  # being merely attempted (correct ≠ attempted by definition).
  # External and Aichat are NOT validated; all other types are.
  #
  # @param lesson_id [Integer]
  # @param student_id [Integer]
  # @return [Hash] with keys:
  #   :levels_total_count                [Integer]
  #   :levels_attempted_count            [Integer]
  #   :validated_levels_total_count      [Integer]  levels where correct ≠ attempted
  #   :validated_levels_correct_count    [Integer]  validated levels the student passed
  #   :validated_levels_incorrect_count  [Integer]  validated levels attempted but not passed
  def lesson_progress_status(lesson_id, student_id)
    lesson = Lesson.find(lesson_id)
    script_levels = lesson.script_levels.includes(:levels)
    sublevel_map = build_sublevel_map(script_levels)

    all_level_ids = script_levels.flat_map(&:level_ids) +
      sublevel_map.values.flatten.map(&:id)

    user_levels = load_user_levels(lesson, student_id, all_level_ids)
    evaluations = load_evaluations(lesson, student_id, all_level_ids)
    aichat_event_level_ids = load_aichat_events(lesson, student_id, all_level_ids)
    ensure_free_response_evaluations(sublevel_map, user_levels, evaluations, lesson, student_id)

    results = script_levels.flat_map(&:levels).map do |level|
      level_completion_status(level, sublevel_map[level.id], user_levels, evaluations, aichat_event_level_ids)
    end

    aggregate_progress_status(results)
  end

  # Returns total seconds the student spent on all levels in a lesson.
  # Executes a single aggregate JOIN query — no Ruby-side iteration.
  #
  # @param lesson_id [Integer]
  # @param student_id [Integer]
  # @return [Integer] sum of time_spent across all UserLevels (0 if none)
  def lesson_time_spent(lesson_id, student_id)
    lesson = Lesson.find(lesson_id)
    UserLevel.
      joins(
        "INNER JOIN levels_script_levels ON levels_script_levels.level_id = user_levels.level_id " \
        "INNER JOIN script_levels ON script_levels.id = levels_script_levels.script_level_id   " \
        "AND script_levels.script_id = user_levels.script_id"
      ).
      where(user_id: student_id, script_id: lesson.script_id).
      where(script_levels: {stage_id: lesson_id}).
      sum(:time_spent).
      to_i
  end

  def lesson_reflection_data(lesson_id, student_id)
    lesson_reflection = UserLessonReflection.find_by(lesson_id: lesson_id, student_id: student_id)
    objective_reflections = UserLessonObjectiveReflection.
      joins(:objective).
      where(objectives: {lesson_id: lesson_id}, student_id: student_id).
      map {|r| {objective_id: r.objective_id, description: r.objective.description, rating: r.reflection}}

    {
      success: lesson_reflection&.success,
      struggle: lesson_reflection&.struggle,
      objective_reflections: objective_reflections
    }
  end

  private def build_sublevel_map(script_levels)
    sublevel_map = {}
    script_levels.flat_map(&:levels).each do |level|
      if level.is_a?(BubbleChoice)
        sublevel_map[level.id] = level.sublevels
      elsif level.is_a?(LevelGroup)
        sublevel_map[level.id] = level.levels
      end
    end
    sublevel_map
  end

  private def load_user_levels(lesson, student_id, level_ids)
    UserLevel.
      where(user_id: student_id, level_id: level_ids, script: lesson.script).
      includes(:level_source).
      index_by(&:level_id)
  end

  private def load_aichat_events(lesson, student_id, level_ids)
    AichatEvent.
      where(user_id: student_id, level_id: level_ids, script_id: lesson.script_id).
      distinct.
      pluck(:level_id).
      to_set
  end

  private def load_evaluations(lesson, student_id, level_ids)
    UserLevelEvaluation.
      where(student_id: student_id, level_id: level_ids, unit_id: lesson.script_id).
      index_by(&:level_id)
  end

  private def ensure_free_response_evaluations(sublevel_map, user_levels, evaluations, lesson, student_id)
    sublevel_map.values.flatten.select {|sl| sl.is_a?(FreeResponse)}.each do |sublevel|
      next if evaluations[sublevel.id]
      ul = user_levels[sublevel.id]
      next if ul&.level_source&.data.blank?
      OpenaiEvaluateHelper.evaluate_free_response(ul, lesson.script)
      evaluations[sublevel.id] = UserLevelEvaluation.find_by(
        student_id: student_id,
        level_id: sublevel.id,
        unit_id: lesson.script_id
      )
    end
  end

  private def level_completion_status(level, sublevels, user_levels, evaluations, aichat_event_level_ids)
    case level
    when Aichat
      [*aichat_status(level, user_levels, aichat_event_level_ids), false]
    when External
      [*simple_level_status(user_levels[level.id]), false]
    when BubbleChoice
      validated = sublevels.any? {|sl| !sl.is_a?(External) && !sl.is_a?(Aichat)}
      [*bubble_choice_status(sublevels, user_levels), validated]
    when LevelGroup
      [*level_group_status(sublevels, user_levels, evaluations), true]
    else
      [*simple_level_status(user_levels[level.id]), true]
    end
  end

  private def aichat_status(level, user_levels, aichat_event_level_ids)
    attempted = user_levels[level.id]&.attempted? && aichat_event_level_ids.include?(level.id)
    [attempted, attempted]
  end

  private def simple_level_status(ul)
    [ul&.attempted? || false, ul&.passing? || false]
  end

  private def bubble_choice_status(sublevels, user_levels)
    uls = sublevels.filter_map {|sl| user_levels[sl.id]}
    complete = uls.any?(&:attempted?)
    [complete, complete && uls.any?(&:passing?)]
  end

  private def level_group_status(sublevels, user_levels, evaluations)
    complete = sublevels.any? {|sl| user_levels[sl.id]&.attempted?}
    correct = complete && all_sublevels_correct?(sublevels, user_levels, evaluations)
    [complete, correct]
  end

  private def all_sublevels_correct?(sublevels, user_levels, evaluations)
    sublevels.
      select {|sl| user_levels[sl.id]&.attempted?}.
      all? {|sl| sublevel_correct?(sl, user_levels[sl.id], evaluations[sl.id])}
  end

  private def sublevel_correct?(sublevel, ul, evaluation)
    if sublevel.is_a?(FreeResponse)
      evaluation&.evaluation == SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT]
    else
      ul&.passing? || false
    end
  end

  private def aggregate_progress_status(results)
    attempted = results.select {|(complete, _, _)| complete}
    validated = results.select {|(_, _, v)| v}
    {
      levels_total_count: results.size,
      levels_attempted_count: attempted.size,
      validated_levels_total_count: validated.size,
      validated_levels_correct_count: validated.count {|(_, correct, _)| correct},
      validated_levels_incorrect_count: validated.count {|(complete, correct, _)| complete && !correct}
    }
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

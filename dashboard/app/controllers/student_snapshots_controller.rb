class StudentSnapshotsController < ApplicationController
  include LevelsHelper

  before_action :authenticate_user!

  layout false

  # GET /student_snapshots/lessons
  def lessons
    unit_id = params[:unit_id]
    context = Queries::Courses.get_course_context(unit_id)
    unit = context[:unit]
    return render json: {error: "Can't find Unit id=#{unit_id}"}, status: :bad_request unless unit

    lessons_data = unit.lessons.map do |lesson|
      {
        id: lesson.id,
        name: lesson.localized_name,
        hasLessonPlan: lesson.has_lesson_plan,
        isLockable: lesson.lockable,
        position: lesson.relative_position
      }
    end

    render json: {lessons: lessons_data, hasUnnumberedLessons: unit.has_unnumbered_lessons?}
  end

  # GET /student_snapshots/cfu_levels/:lesson_id
  # Returns all CFU levels from the specified lesson, including metadata and basic question content.
  # CFU levels are identified by progression: "Check Your Understanding"
  # or "Check For Understanding".
  #
  # This endpoint returns lesson-wide CFU metadata plus basic question content.
  def cfu_levels
    lesson_id = params[:lesson_id]
    lesson = Lesson.find_by(id: lesson_id)
    return render json: {error: "Can't find Lesson id=#{lesson_id}"}, status: :bad_request unless lesson

    lesson_level_ids = lesson.levels&.map(&:id)&.presence || []
    cfu_levels_data = []
    cfu_script_levels_for(lesson).each do |script_level|
      script_level.levels.each do |level|
        question_text, answers = get_level_question_and_answers(level)
        level_index_in_lesson = lesson_level_ids.index(level.id)

        cfu_levels_data << {
          id: level.id,
          name: level.name,
          display_name: level.display_name || level.name,
          type: level.type,
          key: level.try(:key),
          script_level_id: script_level.id,
          level_position: level_index_in_lesson ? level_index_in_lesson + 1 : -1,
          progression: script_level.progression,
          progression_display_name: script_level.progression ? I18n.t(script_level.progression, scope: %i[data progressions], default: script_level.progression) : nil,
          question_text: question_text,
          answers: answers
        }
      end
    end

    render json: {cfu_levels: cfu_levels_data}
  end

  # GET /student_snapshots/cfu_responses/:lesson_id
  # Returns CFU response data for a specific student within a lesson.
  # Combines CFU metadata (by lesson_id) with the student's latest response
  # to each CFU level, if any.
  def cfu_responses
    lesson_id = params[:lesson_id]
    student_id = params[:student_id]

    lesson = Lesson.find_by(id: lesson_id)
    return render json: {error: "Can't find Lesson id=#{lesson_id}"}, status: :bad_request unless lesson

    student = User.find_by(id: student_id)
    return render json: {error: "Can't find Student id=#{student_id}"}, status: :bad_request unless student

    script = lesson.script
    cfu_responses_data = []

    # Precompute CFU script levels and batch-load all relevant UserLevels to avoid N+1 queries.
    script_levels = cfu_script_levels_for(lesson)
    non_level_group_levels = script_levels.flat_map(&:levels).reject {|level| level.is_a?(LevelGroup)}
    level_ids = non_level_group_levels.map(&:id)

    user_levels_by_level_id =
      if level_ids.empty?
        {}
      else
        UserLevel.where(user: student, script: script, level_id: level_ids).
          includes(:level_source).
          order(updated_at: :desc).
          group_by(&:level_id).
          transform_values(&:first)
      end

    script_levels.each do |script_level|
      script_level.levels.each do |level|
        # CFUs can be a LevelGroup (collection of sublevels). In that case, the
        # student's responses live on the sublevels, not on the parent itself.
        if level.is_a?(LevelGroup)
          cfu_responses_data << build_cfu_level_group_response(level, script_level, student, script)
        else
          user_level = user_levels_by_level_id[level.id]
          response_summary = summarize_cfu_level_result(level, user_level)

          cfu_responses_data << {
            level_id: level.id,
            script_level_id: script_level.id,
            response: response_summary,
            submitted: user_level&.submitted || submitted?(response_summary[:status]),
            timestamp: user_level&.updated_at
          }
        end
      end
    end

    render json: {cfu_responses: cfu_responses_data}
  end

  # GET /student_snapshots/units/:unit_id/lessons/:lesson_id/students/:student_id/code
  def student_code
    lesson = Lesson.find_by(id: params[:lesson_id])
    return render json: {error: "Can't find Lesson id=#{params[:lesson_id]}"}, status: :bad_request unless lesson

    # Get the last Pythonlab level for this lesson
    level = lesson.levels.where(type: 'Pythonlab').last

    if level
      student_code_data = get_student_code(params[:student_id], level, params[:unit_id])
      render json: {studentCode: student_code_data[:student_code]}
    else
      render json: {studentCode: nil}
    end
  end

  # Returns the script_levels in a lesson that correspond to CFU progressions.
  private def cfu_script_levels_for(lesson)
    lesson.script_levels.select do |script_level|
      script_level.progression&.match?(/^Check\s+(Your|For)\s+Understanding$/i)
    end
  end

  # Summarizes a single CFU level result for a given student answer.
  # This mirrors summarize_level_result from Api::V1::AssessmentsController
  # but without aggregated stats.
  private def summarize_cfu_level_result(level, student_user_level)
    level_result = {
      type: (
        case level
        when TextMatch, FreeResponse
          "FreeResponse"
        when Multi
          "Multi"
        when Match
          "Match"
        else
          # For any unexpected level types, still return a stable shape.
          level.type
        end
      )
    }

    student_answer = student_user_level&.level_source&.data

    if student_answer
      case level
      when TextMatch, FreeResponse
        level_result[:student_result] = student_answer
        level_result[:status] = student_answer.empty? ? "unsubmitted" : "submitted"
      when Multi
        answer_indexes = level.correct_answer_indexes_array
        student_result = student_answer.split(",").map(&:to_i).sort
        level_result[:student_result] = student_result

        if student_result == [-1]
          level_result[:student_result] = []
          level_result[:status] = "unsubmitted"
        elsif student_result.present? && student_result - answer_indexes == [] && answer_indexes.length == student_result.length
          level_result[:status] = "correct"
        else
          level_result[:status] = "incorrect"
        end
      when Match
        student_result = student_answer.split(",", -1)
        student_result = student_result.map do |result|
          result.empty? ? nil : result.to_i
        end
        level_result[:student_result] = student_result

        level_result[:status] = "unsubmitted"
        unless student_result.empty?
          level_result[:status] = student_user_level&.best_result && student_user_level.best_result >= 100 ? "correct" : "incorrect"
        end
      end
    else
      level_result[:status] = "unsubmitted"
    end

    level_result
  end

  # Builds a response object for a LevelGroup CFU by summarizing each sublevel.
  private def build_cfu_level_group_response(level_group, script_level, student, script)
    sublevels = level_group.levels
    level_ids = ([level_group.id] + sublevels.map(&:id)).uniq

    # Fetch latest UserLevels for the parent + all sublevels in one query.
    user_levels = UserLevel.where(user: student, script: script, level_id: level_ids).
      order(level_id: :asc, updated_at: :desc).to_a

    latest_by_level_id = {}
    user_levels.each do |ul|
      latest_by_level_id[ul.level_id] ||= ul
    end

    parent_ul = latest_by_level_id[level_group.id]

    sublevel_results = sublevels.map do |sublevel|
      summarize_cfu_level_result(sublevel, latest_by_level_id[sublevel.id]).merge(level_id: sublevel.id)
    end

    {
      level_id: level_group.id,
      script_level_id: script_level.id,
      response: {
        type: "LevelGroup",
        level_results: sublevel_results
      },
      submitted: parent_ul&.submitted || (sublevel_results.all? {|sublevel_result| submitted?(sublevel_result[:status])}),
      timestamp: parent_ul&.updated_at
    }
  end

  # For Levels, return its question text and possible answers
  # For LevelGroups, return an array of the sublevel question texts and their respective possible answers
  private def get_level_question_and_answers(level)
    if level.is_a?(LevelGroup)
      level_group_question_texts = []
      level_group_answers = []
      level.levels.each do |sublevel|
        sublevel_question_text, sublevel_answer_text = get_level_question_and_answers(sublevel)
        level_group_question_texts << sublevel_question_text
        level_group_answers << sublevel_answer_text
      end
      return level_group_question_texts, level_group_answers
    else
      question_summary = level.respond_to?(:question_summary) ? level.question_summary : nil
      question_text = question_summary&.dig(:question_text) || question_summary&.dig(:question)
      return question_text, (question_summary&.dig(:answers) || question_summary&.dig('answers'))
    end
  end

  private def submitted?(status)
    status.is_a?(Array) ? status.exclude?("unsubmitted") : status != "unsubmitted"
  end
end

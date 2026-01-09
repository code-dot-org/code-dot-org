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

    cfu_levels_data = []
    cfu_script_levels_for(lesson).each do |script_level|
      script_level.levels.each do |level|
        # Use existing Level helpers to get question text / answers when available.
        question_summary = level.respond_to?(:question_summary) ? level.question_summary : nil
        question_text = question_summary&.dig(:question_text) || question_summary&.dig(:question)
        answers = question_summary&.dig(:answers)

        cfu_levels_data << {
          id: level.id,
          name: level.name,
          display_name: level.display_name || level.name,
          type: level.type,
          key: level.try(:key),
          script_level_id: script_level.id,
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

    cfu_script_levels_for(lesson).each do |script_level|
      script_level.levels.each do |level|
        # CFUs can be a LevelGroup (collection of sublevels). In that case, the
        # student's responses live on the sublevels, not on the parent itself.
        if level.is_a?(LevelGroup)
          cfu_responses_data << build_cfu_level_group_response(level, script_level, student, script)
        else
          user_level = UserLevel.where(user: student, script: script, level: level).
            order(updated_at: :desc).first
          student_answer = user_level&.level_source&.data

          response_summary = summarize_cfu_level_result(level, student_answer)

          cfu_responses_data << {
            level_id: level.id,
            script_level_id: script_level.id,
            response: response_summary,
            submitted: user_level&.submitted,
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
  private def summarize_cfu_level_result(level, student_answer)
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

    if student_answer
      case level
      when TextMatch, FreeResponse
        level_result[:student_result] = student_answer
        level_result[:status] = ""
      when Multi
        answer_indexes = Unit.cache_find_level(level.id).correct_answer_indexes_array
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

        option_status = []
        student_result.each_with_index do |answer, index|
          option_status[index] = answer.nil? ? "unsubmitted" : "submitted"
        end
        level_result[:status] = option_status
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
      ul = latest_by_level_id[sublevel.id]
      student_answer = ul&.level_source&.data
      summarize_cfu_level_result(sublevel, student_answer).merge(level_id: sublevel.id)
    end

    {
      level_id: level_group.id,
      script_level_id: script_level.id,
      response: {
        type: "LevelGroup",
        level_results: sublevel_results
      },
      submitted: parent_ul&.submitted,
      timestamp: parent_ul&.updated_at
    }
  end
end

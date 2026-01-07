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
  # Returns all CFU levels from the specified lesson
  # CFU levels are identified by progression: "Check Your Understanding"
  def cfu_levels
    lesson_id = params[:lesson_id]
    lesson = Lesson.find_by(id: lesson_id)
    return render json: {error: "Can't find Lesson id=#{lesson_id}"}, status: :bad_request unless lesson

    cfu_levels_data = []
    lesson.script_levels.each do |script_level|
      # Check if this script_level has progression: "Check Your Understanding" or "Check For Understanding"
      if script_level.progression&.match?(/^Check\s+(Your|For)\s+Understanding$/i)
        script_level.levels.each do |level|
          cfu_levels_data << {
            id: level.id,
            name: level.name,
            display_name: level.display_name || level.name,
            type: level.type,
            key: level.try(:key),
            script_level_id: script_level.id,
            progression: script_level.progression,
            progression_display_name: script_level.progression ? I18n.t(script_level.progression, scope: %i[data progressions], default: script_level.progression) : nil
          }
        end
      end
    end

    render json: {cfu_levels: cfu_levels_data}
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
end

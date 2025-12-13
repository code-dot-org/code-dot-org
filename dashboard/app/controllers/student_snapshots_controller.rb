class StudentSnapshotsController < ApplicationController
  before_action :authenticate_user!

  layout false

  # GET /student_snapshots/units/:unit_id/lessons
  def lessons
    unit_id = params[:unit_id]
    unit = find_unit(unit_id)
    return render json: {error: "Can't find Unit id=#{unit_id}"}, status: :bad_request unless unit

    lessons_data = build_lessons_data(unit)

    render json: {lessons: lessons_data, hasUnnumberedLessons: unit.has_unnumbered_lessons?}
  end

  # GET /student_snapshots/lessons/:lesson_id/data
  def lesson_data
    lesson = Lesson.find_by(id: params[:lesson_id])
    return render json: {error: "Can't find Lesson id=#{params[:lesson_id]}"}, status: :bad_request unless lesson

    response = {}

    if params[:include_pythonlab]
      response[:pythonlabLevel] = pythonlab_level_data(lesson)
    end

    if params[:include_cfu]
      response[:cfuLevels] = cfu_levels_data(lesson)
    end

    # Add more widget types as needed
    # if params[:include_other_widget]
    #   response[:otherWidget] = other_widget_data(lesson)
    # end

    render json: response
  end

  private def find_unit(unit_id)
    context = Queries::Courses.get_course_context(unit_id)
    context[:unit]
  end

  private def build_lessons_data(unit)
    unit.lessons.map do |lesson|
      {
        id: lesson.id,
        name: lesson.localized_name,
        hasLessonPlan: lesson.has_lesson_plan,
        isLockable: lesson.lockable,
        position: lesson.relative_position,
      }
    end
  end

  private def pythonlab_level_data(lesson)
    level = lesson.levels.where(type: 'Pythonlab').last
    level_data(level)
  end

  private def cfu_levels_data(lesson)
    # TODO: Implement CFU (Checks for Understanding) data retrieval
    # This is a placeholder for future implementation
    lesson.levels.where(type: 'LevelGroup').map do |level|
      {
        id: level.id,
        name: level.name
      }
    end
  end

  private def level_data(level)
    return nil unless level

    {
      id: level.id,
      name: level.name,
      exemplarSources: level.exemplar_sources
    }
  end
end

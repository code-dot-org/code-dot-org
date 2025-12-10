class StudentSnapshotsController < ApplicationController
  before_action :authenticate_user!

  layout false

  # GET /student_snapshots/lessons
  def lessons
    unit = find_unit
    return render json: {error: "Can't find Unit id=#{unit_id}"}, status: :bad_request unless unit

    lessons_data = build_lessons_data(unit)

    render json: {lessons: lessons_data, hasUnnumberedLessons: unit.has_unnumbered_lessons?}
  end

  private def find_unit
    unit_id = params[:unit_id]
    context = Queries::Courses.get_course_context(unit_id)
    context[:unit]
  end

  private def build_lessons_data(unit)
    unit.lessons.includes(:levels).map do |lesson|
      last_pythonlab_level = lesson.levels.where(type: 'Pythonlab').last

      {
        id: lesson.id,
        name: lesson.localized_name,
        hasLessonPlan: lesson.has_lesson_plan,
        isLockable: lesson.lockable,
        position: lesson.relative_position,
        levelData: level_data(last_pythonlab_level)
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

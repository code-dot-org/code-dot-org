class StudentSnapshotsController < ApplicationController
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
end

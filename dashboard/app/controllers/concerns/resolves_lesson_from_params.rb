# Resolves a Lesson from the two URL families the lesson pages use:
#
#   /lessons/:id/...                       (numeric lesson id; CanCanCan
#                                            or Lesson.find handles this)
#   /s/:script/lessons/:position/...       (unit context + lesson's
#   /courses/:course/units/:position/...    relative_position on the page)
#
# Position-based lookup needs the surrounding unit context, which is
# itself derived from whichever URL form is in play. Shared by
# LessonsController and the per-page controllers split out from it
# (e.g. Lessons::SlidesController) so the position-walking logic lives
# in one place.
module ResolvesLessonFromParams
  extend ActiveSupport::Concern

  private def lookup_by_position
    unit_context = get_unit_context(params)
    script = unit_context[:unit]
    lesson = script.lessons.find do |l|
      l.has_lesson_plan && l.relative_position == params[:lesson_position].to_i
    end
    raise ActiveRecord::RecordNotFound unless lesson
    lesson
  end

  private def get_unit_context(params)
    # /s/.../lessons/... URL
    if params[:script_id]
      context = Queries::Courses.get_course_context(params[:script_id])
      raise ActiveRecord::RecordNotFound unless context && context[:unit]
      return context
    end
    # /courses/.../unit/.../lessons/...
    course_name = params[:course_course_name]
    unit_position = params[:unit_position]
    if course_name && unit_position
      context = Queries::Courses.get_unit_context(course_name, unit_position)
      raise ActiveRecord::RecordNotFound unless context && context[:unit]
      return context
    end
    raise ActiveRecord::RecordNotFound
  end
end

class Api::V1::TutorGalleryDataController < Api::V1::JSONApiController
  before_action :authenticate_user!

  # GET /api/v1/scripts/:script_id/lessons/:lesson_position/tutor_gallery_data
  def show
    context = Queries::Courses.get_course_context(params[:script_id])
    script = context[:unit]
    return head :not_found unless script

    lesson = script.lessons.find do |l|
      l.has_lesson_plan && l.relative_position == params[:lesson_position].to_i
    end
    return head :not_found unless lesson&.lesson_tutor_available?

    unit_group = context[:unit_group] || script.original_unit_group
    render json: lesson.summarize_for_tutor_gallery(current_user, unit_group)
  end
end

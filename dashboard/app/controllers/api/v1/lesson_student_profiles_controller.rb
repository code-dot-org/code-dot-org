class Api::V1::LessonStudentProfilesController < Api::V1::JSONApiController
  before_action :authenticate_user!

  # GET /api/v1/lessons/:lesson_id/student_profile
  #
  # Returns the lesson student profile for the current user.
  # Response: { completion: 'all'|'some'|'none', correctness: 'all'|'some'|'none'|'na' }
  def show
    lesson = Lesson.find(params[:lesson_id])
    authorize! :read, lesson

    profile = LessonStudentProfiler.new(lesson, current_user).call
    render json: profile
  end
end

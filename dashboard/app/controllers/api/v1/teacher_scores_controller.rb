class Api::V1::TeacherScoresController < Api::V1::JsonApiController
  before_action :authenticate_user!
  authorize_resource

  # POST /teacher_scores
  def score_lessons_for_section
    section = Section.find(params[:section_id])
    if section.user_id == current_user.id
      TeacherScore.transaction do
        params[:lesson_scores].each do |lesson_score|
          TeacherScore.score_lesson_for_section(
            params[:section_id],
            lesson_score[:lesson_id],
            lesson_score[:score]
          )
        end
        head :no_content
      end
    else
      head :forbidden
    end
  end

  # GET /teacher_scores/<:section_id>/<:script_id>
  def get_teacher_scores_for_script
    section = Section.find(params[:section_id])
    page = [params[:page].to_i, 1].max
    if section.user_id == current_user.id
      @teacher_scores = TeacherScore.get_level_scores_for_script_for_section(
        params[:script_id],
        params[:section_id],
        page
      )
      render json: @teacher_scores, each_serializer: Api::V1::TeacherScoreSerializer
    else
      head :forbidden
    end
  end

  private

  # Never trust parameters from the scary internet, only allow the following
  # list through.
  def teacher_score_params
    params.require(:teacher_score).permit(:user_level_id, :score, :teacher_id, :section_id, :lesson_id, :script_id)
  end
end

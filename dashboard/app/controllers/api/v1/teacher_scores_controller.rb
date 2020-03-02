class Api::V1::TeacherScoresController < Api::V1::JsonApiController
  before_action :authenticate_user!
  authorize_resource

  # POST /teacher_scores
  def score_stage_for_section
    section = Section.find(params[:section_id])
    if section.user_id == current_user.id
      TeacherScore.score_stage_for_section(
        section,
        params[:stage_id],
        params[:score]
      )
      head :no_content
    else
      head :forbidden
    end
  end

  private

  # Never trust parameters from the scary internet, only allow the following
  # list through.
  def teacher_score_params
    params.require(:teacher_score).permit(:user_level_id, :score, :teacher_id, :section_id, :stage_id)
  end
end

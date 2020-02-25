class Api::V1::TeacherScoresController < Api::V1::JsonApiController
  authorize_resource

  # POST /teacher_scores/:section_id/:stage_id/:score
  def score_stage_for_section
    TeacherScore.score_stage_for_section(
      current_user.id,
      params[:section_id],
      params[:stage_id],
      params[:score]
    )
    head :no_content
  end

  private

  # Never trust parameters from the scary internet, only allow the white list through.
  def teacher_score_params
    params.require(:teacher_score).permit(:user_level_id, :score, :teacher_id)
  end
end

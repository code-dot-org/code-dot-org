class SkillsController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  def create
    @skill = Skill.new(skill_params)

    if @skill.save
      render json: {status: 'success', message: 'Skill saved successfully'}, status: :created
    else
      render json: {status: 'error', message: @skill.errors.full_messages.to_sentence}, status: :bad_request
    end
  end

  private def skill_params
    params.permit(
      :key,
      :description,
      :evaluationCriteria,
      :concept,
    ).transform_keys {|key| key.to_s.underscore.to_sym}
  end
end

class LevelsSkillsController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  def create
    @levels_skill = LevelsSkill.new(levels_skill_params)

    if @levels_skill.save
      render json: {status: 'success', message: 'LevelsSkill saved successfully'}, status: :created
    else
      render json: {status: 'error', message: @levels_skill.errors.full_messages.to_sentence}, status: :bad_request
    end
  end

  private def levels_skill_params
    params.permit(
      :skillId,
      :levelId,
    ).transform_keys {|key| key.to_s.underscore.to_sym}
  end
end

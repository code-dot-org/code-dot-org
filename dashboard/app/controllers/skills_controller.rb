class SkillsController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  def index
    skills = Skill.all
    skills_by_concept = {}
    skills.each do |skill|
      formatted_skill = skill.attributes.deep_transform_keys {|key| key.to_s.camelize(:lower)}
      if skills_by_concept.key?(skill.concept)
        skills_by_concept[skill.concept] << formatted_skill
      else
        skills_by_concept[skill.concept] = [formatted_skill]
      end
    end
    @skills_by_concept = skills_by_concept
    levels = LevelsSkill.all.map(&:level).uniq
    @levels_skills = levels.map(&:summarize_for_levels_skills)
  end

  def create
    @skill = Skill.new(skill_params)

    if @skill.save
      @skill.write_serialization
      render json: {status: 'success', message: 'Skill saved successfully'}, status: :created
    else
      render json: {status: 'error', message: @skill.errors.full_messages.to_sentence}, status: :bad_request
    end
  end

  def update
    @skill = Skill.find(params[:id])
    if @skill.update(skill_params)
      @skill.write_serialization
      render json: {status: 'success', message: 'Skill updated successfully'}, status: :ok
    else
      render json: {status: 'error', message: @skill.errors.full_messages.to_sentence}, status: :bad_request
    end
  end

  def destroy
    @skill = Skill.find(params[:id])
    if @skill.destroy
      render json: {status: 'success', message: 'Skill deleted successfully'}, status: :ok
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

class JitPlTeachingTipsController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env
  before_action :set_concept
  before_action :set_teaching_tip, only: [:update, :destroy]
  authorize_resource

  # POST /jit_pl_concepts/:jit_pl_concept_id/jit_pl_teaching_tips
  def create
    @teaching_tip = @concept.jit_pl_teaching_tips.new(teaching_tip_params)
    if @teaching_tip.save
      @teaching_tip.resources = Resource.where(id: params[:resource_ids] || [])
      @concept.reload.write_serialization
      render json: @teaching_tip.serialize
    else
      render status: :bad_request, json: @teaching_tip.errors
    end
  end

  # PUT /jit_pl_concepts/:jit_pl_concept_id/jit_pl_teaching_tips/:id
  def update
    @teaching_tip.update!(teaching_tip_params)
    @teaching_tip.resources = Resource.where(id: params[:resource_ids] || [])
    @concept.reload.write_serialization
    render json: @teaching_tip.serialize
  end

  # DELETE /jit_pl_concepts/:jit_pl_concept_id/jit_pl_teaching_tips/:id
  def destroy
    @teaching_tip.destroy!
    @concept.reload.write_serialization
    render status: :ok, plain: "Destroyed JitPlTeachingTip #{@teaching_tip.id}"
  end

  private def set_concept
    @concept = JitPlConcept.find(params[:jit_pl_concept_id])
  rescue ActiveRecord::RecordNotFound
    render :not_found
  end

  private def set_teaching_tip
    @teaching_tip = @concept.jit_pl_teaching_tips.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render :not_found
  end

  private def teaching_tip_params
    params.permit(:name, :text_content)
  end
end

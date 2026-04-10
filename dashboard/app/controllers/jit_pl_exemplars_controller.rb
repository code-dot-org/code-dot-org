class JitPlExemplarsController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env
  before_action :set_concept
  before_action :set_misconception
  before_action :set_exemplar, only: [:update, :destroy]
  authorize_resource

  # POST /jit_pl_concepts/:jit_pl_concept_id/jit_pl_exemplars
  # POST /jit_pl_concepts/:jit_pl_concept_id/jit_pl_misconceptions/:jit_pl_misconception_id/jit_pl_exemplars
  def create
    @exemplar = parent_scope.new(exemplar_params)
    if @exemplar.save
      @exemplar.resources = Resource.where(id: params[:resource_ids] || [])
      @concept.reload.write_serialization
      render json: @exemplar.serialize
    else
      render status: :bad_request, json: @exemplar.errors
    end
  end

  # PUT /jit_pl_concepts/:jit_pl_concept_id/jit_pl_exemplars/:id
  # PUT /jit_pl_concepts/:jit_pl_concept_id/jit_pl_misconceptions/:jit_pl_misconception_id/jit_pl_exemplars/:id
  def update
    @exemplar.update!(exemplar_params)
    @exemplar.resources = Resource.where(id: params[:resource_ids] || [])
    @concept.reload.write_serialization
    render json: @exemplar.serialize
  end

  # DELETE /jit_pl_concepts/:jit_pl_concept_id/jit_pl_exemplars/:id
  # DELETE /jit_pl_concepts/:jit_pl_concept_id/jit_pl_misconceptions/:jit_pl_misconception_id/jit_pl_exemplars/:id
  def destroy
    @exemplar.destroy!
    @concept.reload.write_serialization
    render status: :ok, plain: "Destroyed JitPlExemplar #{@exemplar.id}"
  end

  private def set_concept
    @concept = JitPlConcept.find(params[:jit_pl_concept_id])
  rescue ActiveRecord::RecordNotFound
    render :not_found
  end

  private def set_misconception
    return unless params[:jit_pl_misconception_id]
    @misconception = @concept.jit_pl_misconceptions.find(params[:jit_pl_misconception_id])
  rescue ActiveRecord::RecordNotFound
    render :not_found
  end

  private def set_exemplar
    @exemplar = parent_scope.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render :not_found
  end

  private def parent_scope
    @misconception ? @misconception.jit_pl_exemplars : @concept.jit_pl_exemplars.where(jit_pl_misconception_id: nil)
  end

  private def exemplar_params
    params.permit(:name, :text_content, :code_content, :exemplar_type)
  end
end

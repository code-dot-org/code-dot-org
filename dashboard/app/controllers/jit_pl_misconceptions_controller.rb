class JitPlMisconceptionsController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env
  before_action :set_concept
  before_action :set_misconception, only: [:update, :destroy]
  authorize_resource

  # POST /jit_pl_concepts/:jit_pl_concept_id/jit_pl_misconceptions
  def create
    @misconception = @concept.jit_pl_misconceptions.new(misconception_params)
    if @misconception.save
      @misconception.resources = Resource.where(id: params[:resource_ids] || [])
      @concept.reload.write_serialization
      render json: @misconception.serialize
    else
      render status: :bad_request, json: @misconception.errors
    end
  end

  # PUT /jit_pl_concepts/:jit_pl_concept_id/jit_pl_misconceptions/:id
  def update
    @misconception.update!(misconception_params)
    @misconception.resources = Resource.where(id: params[:resource_ids] || [])
    @concept.reload.write_serialization
    render json: @misconception.serialize
  end

  # DELETE /jit_pl_concepts/:jit_pl_concept_id/jit_pl_misconceptions/:id
  def destroy
    @misconception.destroy!
    @concept.reload.write_serialization
    render status: :ok, plain: "Destroyed JitPlMisconception #{@misconception.id}"
  end

  private def set_concept
    @concept = JitPlConcept.find(params[:jit_pl_concept_id])
  rescue ActiveRecord::RecordNotFound
    render :not_found
  end

  private def set_misconception
    @misconception = @concept.jit_pl_misconceptions.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render :not_found
  end

  private def misconception_params
    params.permit(:name, :text_content)
  end
end

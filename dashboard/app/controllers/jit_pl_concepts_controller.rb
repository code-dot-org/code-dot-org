class JitPlConceptsController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env
  before_action :set_jit_pl_concept, only: [:edit, :update, :destroy]
  authorize_resource

  # GET /jit_pl_concepts/new
  def new
  end

  # POST /jit_pl_concepts
  def create
    @concept = JitPlConcept.new(jit_pl_concept_params)
    if @concept.save
      @concept.write_serialization
      redirect_to edit_jit_pl_concept_path(@concept)
    else
      render status: :bad_request, json: @concept.errors
    end
  end

  # GET /jit_pl_concepts/edit
  def edit_all
    @jit_pl_concepts = JitPlConcept.all.order(:name).map(&:serialize)
  end

  # GET /jit_pl_concepts/:id/edit
  def edit
    @jit_pl_concept_data = @concept.serialize
  end

  # PUT /jit_pl_concepts/:id
  def update
    @concept.update!(jit_pl_concept_params)
    @concept.resources = Resource.where(id: params[:resource_ids] || [])
    @concept.write_serialization
    render json: @concept.serialize.to_json
  end

  # DELETE /jit_pl_concepts/:id
  def destroy
    @concept.remove_serialization
    @concept.destroy!
    render status: :ok, plain: "Destroyed JitPlConcept #{@concept.id}"
  end

  private def set_jit_pl_concept
    @concept = JitPlConcept.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render :not_found
  end

  private def jit_pl_concept_params
    params.permit(:name, :display_name, :text_content)
  end
end

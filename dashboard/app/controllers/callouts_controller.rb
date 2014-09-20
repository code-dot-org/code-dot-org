class CalloutsController < ApplicationController
  check_authorization
  load_and_authorize_resource
  before_action :set_callout, only: [:show, :edit, :update, :destroy]

  # GET /callouts
  # GET /callouts.json
  def index
    @callouts = Callout.all
  end

  # GET /callouts/1
  # GET /callouts/1.json
  def show
  end

  # GET /callouts/new
  def new
    @callout = Callout.new
  end

  # GET /callouts/1/edit
  def edit
  end

  # POST /callouts
  # POST /callouts.json
  def create
    @callout = Callout.new(callout_params)

    respond_to do |format|
      if @callout.save
        format.html { redirect_to @callout, notice: I18n.t('crud.created', Callout.model_name.human) }
        format.json { render action: 'show', status: :created, location: @callout }
      else
        format.html { render action: 'new' }
        format.json { render json: @callout.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /callouts/1
  # PATCH/PUT /callouts/1.json
  def update
    respond_to do |format|
      if @callout.update(callout_params)
        format.html { redirect_to @callout, notice: I18n.t('crud.updated', model: Callout.model_name.human) }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @callout.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /callouts/1
  # DELETE /callouts/1.json
  def destroy
    @callout.destroy
    respond_to do |format|
      format.html { redirect_to callouts_url }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_callout
    @callout = Callout.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def callout_params
    params.require(:callout).permit(:element_id, :localization_key)
  end

  # this is to fix a ForbiddenAttributesError cancan issue
  prepend_before_filter do
    params[:callout] &&= callout_params
  end
end

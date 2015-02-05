class DistrictsController < ApplicationController
  # CanCan provides automatic resource loading and authorization for default index + CRUD actions
  load_and_authorize_resource

  # POST /districts
  def create
    @district.save!
    render text: 'OK'
  end

  # GET /districts
  def index
    render json: @districts.as_json
  end

  # GET /districts/1
  def show
    render json: @district.as_json
  end

  # PATCH/PUT /districts/1
  def update
    @district.update!(params[:district])
    render json: @district.as_json
  end

  # DELETE /districts/1
  def destroy
    @district.destroy
    render text: 'OK'
  end

  private
  def district_params
    params.require(:district).permit(:name, :location)
  end
end

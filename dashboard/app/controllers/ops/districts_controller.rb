module Ops
  class DistrictsController < ::ApplicationController
    # CanCan provides automatic resource loading and authorization for default index + CRUD actions
    check_authorization
    load_and_authorize_resource

    def teachers
      p "Teachers: #{@districts.users}"
      render json: @districts.users.as_json
    end

    # POST /ops/districts
    def create
      @district.save!
      render text: 'OK'
    end

    # GET /ops/districts
    def index
      render json: @districts.as_json
    end

    # GET /ops/districts/1
    def show
      render json: @district.as_json
    end

    # PATCH/PUT /ops/districts/1
    def update
      @district.update!(params[:district])
      render json: @district.as_json
    end

    # DELETE /ops/districts/1
    def destroy
      @district.destroy
      render text: 'OK'
    end

    private
    # Required for CanCanCan to work with strong parameters
    # (see: http://guides.rubyonrails.org/action_controller_overview.html#strong-parameters)
    def district_params
      params.require(:district).permit(:name, :location)
    end
  end
end

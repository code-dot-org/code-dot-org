module Ops
  class DistrictsController < ::ApplicationController
    respond_to :html, :xml, :json

    # CanCan provides automatic resource loading and authorization for default index + CRUD actions
    check_authorization
    load_and_authorize_resource
    skip_before_filter :verify_authenticity_token

    # get /ops/districts/1/teachers
    def teachers
      respond_with @district.users, each_serializer: TeacherSerializer
    end

    # POST /ops/districts
    def create
      @district.save!
      render text: 'OK'
    end

    # GET /ops/districts
    def index
      respond_with @districts
    end

    # GET /ops/districts/1
    def show
      respond_with @district
    end

    # PATCH/PUT /ops/districts/1
    def update
      @district.update!(params[:district])
      respond_with @district
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
      params.require(:district).permit(:name, :location, :contact_id)
    end
  end
end

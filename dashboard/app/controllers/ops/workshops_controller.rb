module Ops
  class WorkshopsController < ::ApplicationController
    # CanCan provides automatic resource loading and authorization for default index + CRUD actions
    load_and_authorize_resource

    # POST /ops/workshops
    def create
      @workshop.save!
      render text: 'OK'
    end

    # GET /ops/workshops
    def index
      render json: @workshops.as_json
    end

    # GET /ops/workshops/1
    def show
      render json: @workshop.as_json
    end

    # PATCH/PUT /ops/workshops/1
    def update
      @workshop.update!(params[:workshop])
      render json: @workshop.as_json
    end

    # DELETE /ops/workshops/1
    def destroy
      @workshop.destroy
      render text: 'OK'
    end

    private
    # Required for CanCanCan to work with strong parameters
    # (see: http://guides.rubyonrails.org/action_controller_overview.html#strong-parameters)
    def workshop_params
      params.require(:workshop).permit(
        :name,
        :program_type,
        :location,
        :instructions,
        :cohort_id,
        :facilitator_id
      )
    end
  end
end

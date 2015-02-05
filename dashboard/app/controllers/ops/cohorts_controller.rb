module Ops
  class CohortsController < ::ApplicationController
    # CanCan provides automatic resource loading and authorization for default index + CRUD actions
    load_and_authorize_resource

    # POST /ops/cohorts/1/teacher/1 (todo: set up this custom route manually)
    def add_teacher
      @cohort.add_teacher(params[:teacher_id])
      @cohort.save!
    end

    # POST /ops/cohorts
    def create
      @cohort.save!
      render text: 'OK'
    end

    # GET /ops/cohorts
    def index
      render json: @cohorts.as_json
    end

    # GET /ops/cohorts/1
    def show
      render json: @cohort.as_json
    end

    # PATCH/PUT /ops/cohorts/1
    # todo: Use this route to batch-update the teacher list in a cohort?
    def update
      @cohort.update!(params[:cohort])
      render json: @cohort.as_json
    end

    # DELETE /ops/cohorts/1
    def destroy
      @cohort.destroy
      render text: 'OK'
    end

    private
    # Required for CanCanCan to work with strong parameters
    # (see: http://guides.rubyonrails.org/action_controller_overview.html#strong-parameters)
    def cohort_params
      params.require(:cohort).permit(
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

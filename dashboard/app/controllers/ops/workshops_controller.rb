module Ops
  class WorkshopsController < ::ApplicationController
    # CanCan provides automatic resource loading and authorization for default index + CRUD actions
    check_authorization
    load_and_authorize_resource

    # POST /ops/workshops
    def create
      @workshop.save!
      render text: 'OK'
    end

    # GET /ops/workshops
    def index
      my_workshops =
        if current_user.admin?
          # For admins, list all workshops.
          @workshops
        elsif current_user.permission?('district_contact')
          # For district contacts, list all workshops in all cohorts in their district.
          @workshops.includes(cohort: :districts).where(districts: {contact_id: current_user.try(:id)})
        elsif current_user.permission?('facilitator')
          # For facilitators, list all workshops they're facilitating.
          @workshops.joins(:facilitators).where(facilitators_workshops: {facilitator_id: current_user.try(:id)})
        else
          # For other teachers, list all workshops they're attending.
          @workshops.includes(:teachers).where(users: {id: current_user.try(:id)})
        end
      render json: my_workshops.try(:as_json)
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

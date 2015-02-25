module Ops
  class WorkshopsController < ::ApplicationController
    respond_to :html, :xml, :json

    # CanCan provides automatic resource loading and authorization for default index + CRUD actions
    check_authorization
    load_and_authorize_resource
    skip_before_filter :verify_authenticity_token

    # GET /ops/workshops/1/cohort
    # Get the full cohort list of teachers in a specific workshop (for facilitators)
    def teachers
      # first name, last name, email, district, gender and any workshop details that are available for teachers
      teachers = @workshop.teachers.includes(:district).select('users.id, users.name, users.email, users.username, users.gender')
      respond_with teachers do |format|
        format.json { render json: teachers.to_json(include: :district) }
      end
    end

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
          Workshop.all
        elsif current_user.permission?('district_contact')
          # For district contacts, list all workshops in all cohorts in their district.
          Workshop.includes(cohort: :districts).where(districts: {contact_id: current_user.try(:id)})
        elsif current_user.permission?('facilitator')
          # For facilitators, list all workshops they're facilitating.
          Workshop.joins(:facilitators).where(facilitators_workshops: {facilitator_id: current_user.try(:id)})
        else
          # For other teachers, list all workshops they're attending.
          Workshop.includes(:teachers).where(users: {id: current_user.try(:id)})
        end
      render json: my_workshops.try(:to_json)
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

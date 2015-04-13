module Ops
  class WorkshopsController < OpsControllerBase
    before_filter :convert_facilitators, only: [:create, :update]

    load_and_authorize_resource

    # GET /ops/workshops/1/cohort
    # Get the full cohort list of teachers in a specific workshop (for facilitators)
    def teachers
      # first name, last name, email, district, gender and any workshop details that are available for teachers
      teachers = @workshop.teachers
      respond_with teachers
    end

    # POST /ops/workshops
    def create
      @workshop.update!(params[:workshop])
      respond_with :ops, @workshop
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
          current_user.workshops_as_facilitator
        else
          # For other teachers, list all workshops they're attending.
          Workshop.includes(:teachers).where(users: {id: current_user.try(:id)})
        end
      respond_with my_workshops
    end

    # GET /ops/workshops/1
    def show
      respond_with @workshop
    end

    # PATCH/PUT /ops/workshops/1
    def update
      @workshop.update!(params[:workshop])
      respond_with @workshop
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
        facilitators: [:ops_first_name, :ops_last_name, :email]
      )
    end

    def convert_facilitators
      return unless params[:workshop]
      facilitator_param_list = params[:workshop].delete :facilitators
      return unless facilitator_param_list

      params[:workshop][:facilitators] = facilitator_param_list.map do |facilitator_params|
        next if facilitator_params[:email].blank?

        User.find_or_create_facilitator(facilitator_params, current_user)
      end
    end
  end
end

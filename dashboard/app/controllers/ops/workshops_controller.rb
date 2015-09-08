module Ops
  class WorkshopsController < OpsControllerBase
    before_filter :convert_facilitators, :convert_cohorts, :convert_unexpected_teachers, only: [:create, :update]
    after_filter :notify_ops, only: [:update]

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
          Workshop.includes(cohorts: :districts).where(districts: {contact_id: current_user.try(:id)})
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
      unexpected_teachers = params[:workshop][:unexpected_teachers]
      if unexpected_teachers
        @added_unexpected_teachers = unexpected_teachers - @workshop.unexpected_teachers
      end
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
      #This is necessary because rails turns empty arrays into nil
      if params[:workshop]
        params[:workshop][:facilitators] ||= [] if params[:workshop].has_key?(:facilitators)
        params[:workshop][:unexpected_teachers] ||= [] if params[:workshop].has_key?(:unexpected_teachers)
      end

      params.require(:workshop).permit(
        :name,
        :program_type,
        :location,
        :instructions,
        :link,
        :phase,
        cohorts: [:id, :_destroy],
        facilitators: [:ops_first_name, :ops_last_name, :email],
        unexpected_teachers: [:ops_first_name, :ops_last_name, :email, :district, :district_id, :ops_school, :ops_gender]
      )
    end

    def convert_facilitators
      return unless params[:workshop] && params[:workshop][:facilitators]
      facilitator_param_list = params[:workshop].delete :facilitators
      return unless facilitator_param_list

      params[:workshop][:facilitators] = facilitator_param_list.map do |facilitator_params|
        next if facilitator_params[:email].blank?

        User.find_or_create_facilitator(facilitator_params, current_user)
      end
    end

    def convert_unexpected_teachers
      return unless params[:workshop] && params[:workshop][:unexpected_teachers]
      unexpected_teacher_param_list = params[:workshop].delete :unexpected_teachers
      return unless unexpected_teacher_param_list

      params[:workshop][:unexpected_teachers] = unexpected_teacher_param_list.map do |unexpected_teacher_params|
        next if unexpected_teacher_params[:email].blank?

        district_params = unexpected_teacher_params.delete :district
        if district_params.is_a?(String)
          unexpected_teacher_params[:district_id] = District.find_by!(name: district_params).id
        elsif district_params.is_a?(Hash) && district_params[:id]
          teacher_params[:district_id] = district_params[:id]
        end
        User.find_or_create_teacher(unexpected_teacher_params, current_user)
      end
    end

    def convert_cohorts
      return unless params[:workshop]
      cohort_params_list = params[:workshop].delete :cohorts
      return unless cohort_params_list

      params[:workshop][:workshop_cohorts_attributes] = cohort_params_list.map do |cohort_params|
        {cohort_id: cohort_params[:id],
         _destroy: cohort_params[:_destroy]}.tap do |workshops_cohorts_attrs|
          if params[:id] && existing = WorkshopCohort.find_by(cohort_id: cohort_params[:id], workshop_id: params[:id])
            workshops_cohorts_attrs[:id] = existing.id
          end
        end
      end
    end

    def notify_ops
      return unless @added_unexpected_teachers.present?
      return unless current_user.facilitator?
      OpsMailer.unexpected_teacher_added(current_user, @added_unexpected_teachers, @workshop).deliver
    end
  end
end

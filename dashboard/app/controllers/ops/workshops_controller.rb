module Ops
  class WorkshopsController < OpsControllerBase
    before_filter :convert_cohorts, only: [:create, :update]
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
      add_facilitators

      @workshop.update!(workshop_params)
      render json: @workshop, serializer: DetailedWorkshopSerializer
    end

    # GET /ops/workshops
    def index
      workshops =
        if current_user.admin?
          # For admins, list all workshops.
          # include all associations loaded by the WorkshopSerializer
          Workshop.includes(:cohorts, :facilitators, :segments).all
        elsif current_user.permission?(UserPermission::DISTRICT_CONTACT)
          # For district contacts, list all workshops in all cohorts in their district.
          Workshop.includes(cohorts: :districts).where(districts: {contact_id: current_user.try(:id)})
        elsif current_user.permission?(UserPermission::FACILITATOR)
          # For facilitators, list all workshops they're facilitating.
          current_user.workshops_as_facilitator
        else
          # For other teachers, list all workshops they're attending.
          Workshop.includes(:teachers).where(users: {id: current_user.try(:id)})
        end
      respond_with workshops
    end

    # GET /ops/workshops/1
    def show
      render json: @workshop, serializer: DetailedWorkshopSerializer
    end

    # PATCH/PUT /ops/workshops/1
    def update
      add_facilitators

      add_unexpected_teachers

      @workshop.update!(workshop_params)
      render json: @workshop, serializer: DetailedWorkshopSerializer
    end

    # DELETE /ops/workshops/1
    def destroy
      @workshop.destroy
      render text: 'OK'
    end

    private

    def workshop_params
      # This is necessary because rails turns empty arrays into nil
      if params[:workshop]
        params[:workshop][:facilitators] ||= [] if params[:workshop].key?(:facilitators)
        params[:workshop][:unexpected_teachers] ||= [] if params[:workshop].key?(:unexpected_teachers)
      end

      params.fetch(:workshop, {}).permit(
        :name,
        :program_type,
        :location,
        :instructions,
        :link,
        :phase,
        cohorts: [:id, :_destroy],
        unexpected_teachers: [Ops::TEACHER_PERMITTED_ATTRIBUTES],
        workshop_cohorts_attributes: [:id, :cohort_id, :_destroy]
      )
    end

    def add_facilitators
      facilitator_param_list = params[:workshop].try(:delete, :facilitators)
      return unless facilitator_param_list

      @workshop.facilitators = facilitator_param_list.map do |facilitator_params|
        next if facilitator_params[:email].blank?

        User.find_or_create_facilitator(facilitator_params.permit(Ops::TEACHER_PERMITTED_ATTRIBUTES), current_user)
      end
    end

    def add_unexpected_teachers
      unexpected_teacher_param_list = params[:workshop].try(:delete, :unexpected_teachers)
      return unless unexpected_teacher_param_list

      unexpected_teachers = unexpected_teacher_param_list.map do |unexpected_teacher_params|
        next if unexpected_teacher_params[:email].blank?

        # find district
        district_params = unexpected_teacher_params.delete :district
        if district_params.is_a?(String)
          unexpected_teacher_params[:district_id] = District.find_by!(name: district_params).id
        elsif district_params.is_a?(Hash) && district_params[:id]
          unexpected_teacher_params[:district_id] = district_params[:id]
        end

        # find teacher
        User.find_or_create_teacher(unexpected_teacher_params.permit(Ops::TEACHER_PERMITTED_ATTRIBUTES), current_user)
      end

      if unexpected_teachers
        @added_unexpected_teachers = unexpected_teachers - @workshop.unexpected_teachers
      end

      @workshop.unexpected_teachers = unexpected_teachers
    end

    def convert_cohorts
      cohort_params_list = params[:workshop].try(:delete, :cohorts)
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
      OpsMailer.unexpected_teacher_added(current_user, @added_unexpected_teachers, @workshop).deliver_now
    end
  end
end

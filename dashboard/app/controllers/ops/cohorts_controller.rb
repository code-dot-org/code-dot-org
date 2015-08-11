module Ops
  class CohortsController < OpsControllerBase
    after_filter :notify_district_contact, only: [:update, :destroy_teacher]

    load_and_authorize_resource except: [:index]

    # DELETE /ops/cohorts/1/teachers/:teacher_id
    def destroy_teacher
      user = User.find(params[:teacher_id])
      @removed_teachers = [user]
      @cohort.teachers.delete user
      @cohort.save!
      respond_with @cohort
    end

    # POST /ops/cohorts
    def create
      @cohort.update!(cohort_params)
      respond_with :ops, @cohort
    end

    # GET /ops/cohorts
    def index
      authorize! :manage, Cohort
      @cohorts =
        if current_user.try(:admin?)
          Cohort.all
        elsif current_user.try(:district_contact?)
          current_user.district_as_contact.cohorts
        else
          []
        end
      respond_with @cohorts
    end

    # GET /ops/cohorts/1
    def show
      respond_with @cohort
    end

    # GET /ops/cohorts/1/teachers
    def teachers
      respond_with (@cohort.teachers) do |format|
        format.csv do
          render text: CSV.generate(write_headers: true, headers: User.csv_attributes) {|csv| @cohort.teachers.each {|teacher| csv << teacher.to_csv}}
        end
        # json is handled by ActiveModelSerializers by default
      end
    end

    # PATCH/PUT /ops/cohorts/1
    def update
      teachers = cohort_params.delete(:teachers)
      if teachers
        @added_teachers = teachers - @cohort.teachers

        if current_user.admin?
          # replace
          @cohort.teachers = teachers
        elsif current_user.district_as_contact
          # replace only those in the district
          teachers_in_district = @cohort.teachers.select {|teacher| teacher.district_id == current_user.district_as_contact.id}
          @cohort.teachers = @cohort.teachers - teachers_in_district + teachers

          # cannoy modify districts
        else
          # weird.
          # don't do anything
        end
      end

      @cohort.update!(cohort_params)
      respond_with @cohort
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
      return @cohort_params if @cohort_params
      if current_user.try(:admin?)
        @cohort_params = params.require(:cohort).permit(
            :name,
            :program_type,
            :script_id,
            :cutoff_date,
            :district_ids => [],
            :district_names => [],
            :districts => [:id, :max_teachers, :_destroy],
            :teachers => [:ops_first_name, :ops_last_name, :email, :district, :district_id, :ops_school, :ops_gender],
            :cohorts_districts_attributes => [:cohort_id, :district_id, :max_teachers, :_destroy]
        )
      elsif current_user.try(:district_contact?)
        # district contacts can only edit teachers
        @cohort_params = params.require(:cohort).permit(
            :teachers => [:ops_first_name, :ops_last_name, :email, :district, :district_id, :ops_school, :ops_gender]
        )
      end
      # Do some extra params filtering
      convert_districts_to_cohorts_districts_attributes @cohort_params
      convert_teachers @cohort_params
      timestamp_cutoff_date @cohort_params
      @cohort_params
    end

    # Support district_names in the API
    def convert_districts_to_cohorts_districts_attributes(cp)
      return unless cp
      district_params_list = cp.delete :districts
      return unless district_params_list
      cp[:cohorts_districts_attributes] = district_params_list.map do |district_params|
        {district_id: district_params[:id],
         max_teachers: district_params[:max_teachers],
         _destroy: district_params[:_destroy]}.tap do |cohorts_districts_attrs|
          if params[:id] && existing = CohortsDistrict.find_by(district_id: district_params[:id], cohort_id: params[:id])
            cohorts_districts_attrs[:id] = existing.id
          end
        end
      end
    end

    def convert_teachers(cp)
      return unless cp
      teacher_param_list = cp.delete :teachers
      return unless teacher_param_list
      cp[:teachers] = teacher_param_list.map do |teacher_params|
        next if teacher_params[:email].blank?

        district_params = teacher_params.delete :district
        if district_params.is_a?(String)
          teacher_params[:district_id] = District.find_by!(name: district_params).id
        elsif district_params.is_a?(Hash) && district_params[:id]
          teacher_params[:district_id] = district_params[:id]
        end
        User.find_or_create_teacher(teacher_params, current_user)
      end
    end

    def timestamp_cutoff_date(cp)
      return unless cp
      cutoff_date = cp.delete :cutoff_date
      return unless cutoff_date.present?
      cp[:cutoff_date] = Chronic.parse(cutoff_date).strftime('%Y-%m-%d 00:00:00')
    end

    def notify_district_contact
      # notification to ops team that a district contact added/removed teachers from a cohort
      return unless @added_teachers.present? || @removed_teachers.present?
      return unless current_user.district_contact?

      OpsMailer.district_contact_added_teachers(current_user, @cohort, @added_teachers, @removed_teachers).deliver_now
    end
  end
end

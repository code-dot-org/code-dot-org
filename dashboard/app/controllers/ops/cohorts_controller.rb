module Ops
  class CohortsController < OpsControllerBase
    before_filter :convert_teachers, :convert_district_names, only: [:create, :update]
    load_and_authorize_resource

    # DELETE /ops/cohorts/1/teachers/:teacher_id
    def destroy_teacher
      @cohort.teachers.delete User.find(params[:teacher_id])
      @cohort.save!
      respond_with @cohort
    end

    # POST /ops/cohorts
    def create
      @cohort.update!(params[:cohort])
      respond_with :ops, @cohort
    end

    # GET /ops/cohorts
    def index
      respond_with @cohorts
    end

    # GET /ops/cohorts/1
    def show
      respond_with @cohort
    end

    # PATCH/PUT /ops/cohorts/1
    def update
      @cohort.update!(params[:cohort])
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
      params.require(:cohort).permit(
          :name,
          :program_type,
          :district_ids => [],
          :district_names => [],
          :districts => [],
          :teachers => [:ops_first_name, :ops_last_name, :email, :district] # permit array of objects with specified keys
      )
    end


    # Support district_names in the API
    def convert_district_names
      return unless params[:cohort]
      district_names_list = params[:cohort].delete :district_names
      return unless district_names_list
      params[:cohort][:districts] = district_names_list.map do |district_name|
        District.find_by(name: district_name) || raise("Invalid District: '#{district_name}'")
      end
    end

    def convert_teachers
      return unless params[:cohort]
      teacher_param_list = params[:cohort].delete :teachers
      return unless teacher_param_list

      params[:cohort][:teachers] =
        teacher_param_list.map do |teacher_params|
          if teacher_params[:district] && teacher_params[:district].is_a?(String)
            teacher_params[:district] = District.find_by!(name: teacher_params[:district])
          end
          User.find_or_create_teacher(teacher_params)
      end
    end
  end
end

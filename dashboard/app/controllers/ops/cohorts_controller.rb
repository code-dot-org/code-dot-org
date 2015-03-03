module Ops
  class CohortsController < ::ApplicationController
    respond_to :html, :xml, :json

    # CanCan provides automatic resource loading and authorization for default index + CRUD actions
    before_filter :convert_teacher_info, :convert_district_names, only: [:create, :update]

    check_authorization
    load_and_authorize_resource
    skip_before_filter :verify_authenticity_token

    rescue_from ActiveRecord::RecordInvalid do |e|
      render text: e.to_s, status: :unprocessable_entity
    end

    # POST /ops/cohorts/1/teachers/:teacher_id
    def add_teacher
      @cohort.teachers << User.find(params[:teacher_id])
      @cohort.save!
      respond_with :ops, @cohort
    end

    # DELETE /ops/cohorts/1/teachers/:teacher_id
    def drop_teacher
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
    # todo: Use this route to batch-update the teacher list in a cohort?
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
          :district_ids => [],
          :district_names => [],
          :districts => [],
          :teachers => [],
          :teacher_ids => [], # permit array of scalar values
          :teacher_info => [:name, :email, :district] # permit array of objects with specified keys
      )
    end

    # Support district_names in the API
    def convert_district_names
      return unless params[:cohort]
      district_names_list = params[:cohort].delete :district_names
      if district_names_list
        params[:cohort][:districts] = district_names_list.map do |district_name|
          District.find_by(name: district_name) || raise("Invalid District: '#{district_name}'")
        end
      end
    end

    # Uses a teacher_info object to batch-create new Teacher accounts,
    # matching existing accounts by email.
    def convert_teacher_info
      return unless params[:cohort]
      teacher_info_list = params[:cohort].delete :teacher_info
      if teacher_info_list
        params[:cohort][:teachers] = teacher_info_list.map do |info|
          district_name = info.delete 'district'
          district = District.find_by(name: district_name) || raise("Invalid District: '#{district_name}'")
          info['district'] = district
          email = info.delete 'email'
          teacher = User.create_with({
            user_type: 'teacher',
            age: '21+',
            password: 'changeit' # ops team should provide unique passwords
          }.merge(info)).find_or_create_by(
            email: email
          )
          teacher.update(info) # Update existing teacher accounts with specified info
          teacher
        end
      end
    end
  end
end

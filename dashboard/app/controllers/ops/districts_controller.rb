module Ops
  class DistrictsController < OpsControllerBase
    load_and_authorize_resource

    # get /ops/districts/1/teachers
    def teachers
      respond_with @district.users, each_serializer: TeacherSerializer
    end

    # POST /ops/districts
    def create
      @district.save!
      respond_with :ops, @district
    end

    # GET /ops/districts
    def index
      respond_with @districts
    end

    # GET /ops/districts/1
    def show
      respond_with @district
    end

    # PATCH/PUT /ops/districts/1
    def update
      @district.update!(params[:district])
      respond_with @district
    end

    # DELETE /ops/districts/1
    def destroy
      @district.destroy
      render text: 'OK'
    end

    private
    def contact_params(params)
      {
       # created_by_user_id: current_user.id, # TODO
       email: params[:email],
       name: params[:name]
      }
    end

    def district_params
      # create/find/upgrade district contact user when adding or changing district contact email
      if params[:district][:contact] &&
          params[:district][:contact][:email] &&
          params[:district][:contact][:email] != @district.try(:contact).try(:email)
        # adding/changing district contact
        params[:district][:contact_id] =
          User.find_or_create_district_contact(contact_params(params[:district].delete(:contact))).id
        # TODO do we need to remove the districtcontact permission from the old user?
      end

      params.require(:district).permit(:name, :location, :contact_id)
    end
  end
end

module Ops
  class DistrictsController < OpsControllerBase
    load_and_authorize_resource

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
      @district.update!(district_params)
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
       ops_first_name: params[:ops_first_name],
       ops_last_name: params[:ops_last_name]
      }
    end

    def district_params
      # create/find/upgrade district contact user when adding or changing district contact email
      if params[:district][:contact] &&
          params[:district][:contact][:email] &&
          params[:district][:contact][:email] != @district.try(:contact).try(:email)
        # adding/changing district contact
        params[:district][:contact_id] =
          User.find_or_create_district_contact(contact_params(params[:district].delete(:contact)), current_user).id
        # TODO: Do we need to remove the districtcontact permission from the old user?
      end

      params.require(:district).permit(:name, :location, :contact_id)
    end
  end
end

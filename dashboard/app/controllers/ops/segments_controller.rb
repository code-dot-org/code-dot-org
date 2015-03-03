module Ops
  # Segments are a nested resource of Workshops.
  # see: http://guides.rubyonrails.org/routing.html#nested-resources
  class SegmentsController < ::ApplicationController
    respond_to :html, :xml, :json

    # CanCan provides automatic resource loading and authorization for default index + CRUD actions
    load_and_authorize_resource :workshop
    skip_before_filter :verify_authenticity_token

    # Load shallow nested resource. See https://github.com/CanCanCommunity/cancancan/wiki/Nested-Resources#shallow-nesting
    load_and_authorize_resource through: :workshop, shallow: true

    # POST /ops/workshops/1/segments
    def create
      @segment.save!
      respond_with :ops, @segment
    end

    # GET /ops/workshops/1/segments
    def index
      respond_with @segments
    end

    # GET /ops/segments/1
    def show
      respond_with @segment
    end

    # PATCH/PUT /ops/segments/1
    def update
      @segment.update!(params[:segment])
      respond_with @segment
    end

    # DELETE /ops/segments/1
    def destroy
      @segment.destroy
      render text: 'OK'
    end

    private
    # Required for CanCanCan to work with strong parameters
    # (see: http://guides.rubyonrails.org/action_controller_overview.html#strong-parameters)
    def segment_params
      params.require(:segment).permit(
        :start,
        :end
      )
    end
  end
end

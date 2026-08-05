class Widget2Controller < ApplicationController
  include Widget2Helper

  before_action :authenticate_user!
  before_action :require_levelbuilder_mode
  authorize_resource class: false

  def index
    @widget2s = get_widget2_ids.map do |widget2_id|
      {
        id: widget2_id,
        url: get_widget2_edit_url(widget2_id)
      }
    end

    view_options(full_width: true, responsive_content: true)
  end

  def update_code
    set_widget2_sources(params[:widget2_id], params[:start_sources])
    render json: {}
  rescue ArgumentError => exception
    render json: {error: exception.message}, status: :bad_request
  end

  def new
    redirect_to get_widget2_edit_url(params[:id])
  rescue ArgumentError => exception
    redirect_to '/widget2', flash: {alert: exception.message}
  end
end

class Widget2Controller < ApplicationController
  include Widget2Helper

  before_action :require_levelbuilder_mode

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
    render json: {redirect: "/widget2/edit"}
  end

  def new
    redirect_to get_edit_url(params[:id])
  end
end

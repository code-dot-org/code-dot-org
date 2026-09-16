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
    widget2_id = params[:id]
    # /widget2/:widget2_id/embed resolves to this level, and the frontend fetches its
    # level_properties, so create it here rather than making the author hand-write a
    # .level file. Level's after_save writes that file for us.
    Weblab2.find_or_create_by!(name: Widget2Helper.level_name_for_widget2(widget2_id)) do |level|
      level.game = Game.weblab2
      level.level_num = 'custom'
      level.user = current_user
      level.published = true
      level.properties['widget2'] = {'id' => widget2_id}
    end
    redirect_to get_widget2_edit_url(widget2_id)
  rescue ArgumentError => exception
    redirect_to '/widget2', flash: {alert: exception.message}
  end
end

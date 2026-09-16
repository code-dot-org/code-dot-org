class Widget2Controller < ApplicationController
  include Widget2Helper

  # Editing is for levelbuilders; assets are read by the preview of any level that uses
  # the widget2, so #asset is public like level starter assets.
  before_action :authenticate_user!, except: [:asset]
  before_action :require_levelbuilder_mode, except: [:asset]
  authorize_resource class: false, except: [:asset]

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

  # GET /widget2/:widget2_id/*path
  # A binary asset of a widget2 (image or sound), fetched by the sandboxed preview.
  def asset
    file_path = widget2_asset_path(params[:widget2_id], params[:path])
    return head :not_found unless file_path

    allow_cors_from_preview_hosts
    send_file file_path,
      type: LevelStarterAssetsHelper.file_content_type(File.extname(file_path)),
      disposition: 'inline'
  end
end

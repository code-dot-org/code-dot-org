class Widget2Controller < ApplicationController
  include Widget2Helper

  before_action :require_levelbuilder_mode

  NEW_WEBLAB2_PROJECT_LEVEL_ID = Level.find_by_name("New Web Lab 2 Project")&.id

  def index
    directories = Dir.glob(WIDGET2_BASE_DIRECTORY + '/*')

    @directories = directories.map do |directory|
      {
        name: File.basename(directory),
        url: get_edit_url(File.basename(directory))
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

  private def get_edit_url(widget2_id)
    "/levels/#{NEW_WEBLAB2_PROJECT_LEVEL_ID}/edit_blocks/widget2_sources?widget2=#{widget2_id}"
  end
end

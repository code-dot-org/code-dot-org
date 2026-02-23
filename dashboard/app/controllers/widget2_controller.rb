class Widget2Controller < ApplicationController
  before_action :require_levelbuilder_mode

  BASE_DIRECTORY = "#{Rails.root}/config/widget2".freeze
  NEW_WEBLAB2_PROJECT_LEVEL_ID = Level.find_by_name("New Web Lab 2 Project")&.id

  def index
    directories = Dir.glob(BASE_DIRECTORY + '/*')

    @directories = directories.map do |directory|
      {
        name: File.basename(directory),
        url: get_edit_url(File.basename(directory))
      }
    end

    view_options(full_width: true, responsive_content: true)
  end

  def update_code
    widget2_id = params[:widget2_id]

    widget_dir = File.join(BASE_DIRECTORY, widget2_id.to_s)

    FileUtils.mkdir_p(widget_dir)

    # Accept either `start_sources` or `startSources` and indifferent keys for files
    start_sources = params[:start_sources] || params[:startSources]
    files_hash = start_sources && (start_sources[:files] || start_sources['files'])

    if files_hash.present?
      files_hash.each do |_id, file|
        name = file['name'] || file[:name]
        contents = file['contents'] || file[:contents]
        next unless name && contents

        path = File.join(widget_dir, name)
        File.write(path, contents)
      end
    end

    render json: {redirect: "/widget2/edit"}
  rescue => exception
    Rails.logger.error("widget2#update_code error: #{exception.message}\n#{exception.backtrace.join("\n")}")
    render json: {error: e.message}, status: :internal_server_error
  end

  def new
    redirect_to get_edit_url(params[:id])
  end

  private def get_edit_url(widget2_id)
    "/levels/#{NEW_WEBLAB2_PROJECT_LEVEL_ID}/edit_blocks/widget2_sources?widget2=#{widget2_id}"
  end
end

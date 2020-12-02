class LibrariesController < ApplicationController
  before_action :authenticate_user!, only: :get_updates
  before_action :require_levelbuilder_mode, except: [:show, :get_updates]
  load_and_authorize_resource find_by: :name, except: [:show, :get_updates]

  def show
    render plain: Library.content_from_cache(params[:id])
  end

  def new
    render 'edit'
  end

  def create
    update
  end

  def update
    if @library.update library_params
      redirect_to(
        edit_library_path(id: @library.name),
        notice: 'Library saved',
      )
    else
      render action: 'edit'
    end
  end

  def destroy
    @library.destroy
    redirect_to(libraries_path, notice: 'Library Deleted')
  end

  # GET /libraries/get_updates
  #
  # @param params[:libraries] [Array<Object>] Formatted as follows:
  #   [{channel_id: 'abc123', version: 'xyz987'}]
  # @returns [Array<String>] The libraries from the given libraries that have been updated
  #   (e.g., that library has a different latestLibraryVersion than the given version).
  def get_updates
    libraries = params[:libraries].present? ? JSON.parse(params[:libraries]) : []
    render json: ProjectsList.fetch_updated_library_channels(libraries)
  end

  private

  def library_params
    params.require(:library).permit(
      :name,
      :content,
    )
  end
end

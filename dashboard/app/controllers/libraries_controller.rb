class LibrariesController < ApplicationController
  before_action :require_levelbuilder_mode, except: :show
  load_and_authorize_resource find_by: :name, except: :show

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

  private

  def library_params
    params.require(:library).permit(
      :name,
      :content,
    )
  end
end

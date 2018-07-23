class LibrariesController < ApplicationController
  before_action :require_levelbuilder_mode
  load_and_authorize_resource find_by: :name

  def new
    render 'edit'
  end

  def create
    update
  end

  def update
    if @library.update library_params
      redirect_to(
        edit_library_path(id: @library.id),
        notice: 'Library saved',
      )
    else
      render action: 'edit'
    end
  end

  private

  def library_params
    params.require(:library).permit(
      :name,
      :content,
    )
  end
end

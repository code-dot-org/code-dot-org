class BlocksController < ApplicationController
  load_and_authorize_resource find_by: :name

  def update
    @block.update update_params

    redirect_to(
      edit_block_path(id: @block.name),
      notice: 'Block saved',
    )
  rescue => e
    redirect_back(
      fallback_location: @block.name ? edit_block_path(id: @block.name) : new_block_path,
      alert: "Error saving block: #{e}",
    )
  end

  def update_params
    params['block'].permit(:name, :level_type, :category, :config, :helper_code)
  end
end

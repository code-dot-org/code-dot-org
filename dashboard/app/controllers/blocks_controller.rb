class BlocksController < ApplicationController
  load_and_authorize_resource find_by: :name

  def update
    old_name = @block.name
    old_level_type = @block.level_type
    @block.update update_params
    if @block.name != old_name || @block.level_type != old_level_type
      @block.delete_old_files(old_level_type, old_name)
    end

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

class SharedBlocklyFunctionsController < ApplicationController
  before_action :require_levelbuilder_mode
  before_action :load_block_pool, only: [:new, :edit]
  load_and_authorize_resource

  def new
    render 'edit'
  end

  def create
    update
  end

  def update
    if @shared_blockly_function.update update_params
      redirect_to(
        edit_shared_blockly_function_path(id: @shared_blockly_function.id),
        notice: 'Function definition saved',
      )
    else
      render action: 'edit'
    end
  end

  private

  def load_block_pool
    @@level ||= Level.find_by_key('New Sprite Lab Project')
    @block_pool = @@level.shared_blocks
  end

  def create_params
    update_params
  end

  def update_params
    params.require(:shared_blockly_function).permit(:name, :description, :arguments, :stack)
  end
end

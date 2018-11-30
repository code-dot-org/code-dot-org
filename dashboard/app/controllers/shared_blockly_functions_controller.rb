class SharedBlocklyFunctionsController < ApplicationController
  before_action :require_levelbuilder_mode
  before_action :load_block_pool, only: [:new, :edit]
  load_and_authorize_resource

  def new
    @shared_blockly_function.block_type = 'behavior'
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
    @block_pool = Block.for('GamelabJr', 'Dancelab', 'Vanilla')
  end

  def create_params
    update_params
  end

  def update_params
    params.require(:shared_blockly_function).permit(
      :name,
      :description,
      :arguments,
      :stack,
      :block_type,
      :level_type,
    )
  end
end

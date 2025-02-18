class BlocksController < ApplicationController
  before_action :require_levelbuilder_mode, except: :index
  load_and_authorize_resource find_by: :name

  def index
    @blocks = Block.load_and_cache_by_pool(params[:pool])
  end

  def new
    @block.pool = params[:pool]
    render 'edit'
  end

  def create
    update
  end

  def edit
    if @block.pool != params[:pool]
      redirect_to(edit_block_path(pool: @block.pool, id: @block.name))
    end
  end

  def update
    if params[:commit] == 'Save as Clone'
      @block = @block.dup
    end

    @block.update! update_params
    redirect_to(
      edit_block_path(pool: @block.pool, id: @block.name),
      notice: 'Block saved',
    )
  rescue => exception
    redirect_back(
      fallback_location: @block.name ? edit_block_path(id: @block.name) : new_block_path,
      alert: "Error saving block: #{exception}",
    )
  end

  def destroy
    @block.destroy
    redirect_to(blocks_path, notice: "Block Deleted")
  end

  private def create_params
    update_params
  end

  private def update_params
    params['block'].permit(:name, :pool, :category, :config, :helper_code)
  end
end

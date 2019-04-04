class PoolsController < ApplicationController
  def index
    @pools = Block.all_pool_names
  end
end

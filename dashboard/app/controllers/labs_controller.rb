class LabsController < ApplicationController
  # get /labs/level_id
  def show
    @level = Level.find(level_id)
    render :show
  end
end

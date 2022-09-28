class LabsController < ApplicationController
  # get /labs/level_id
  def show
    @level = Level.find(params[:level_id])
    render :show
  end
end

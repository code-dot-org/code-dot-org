class Api::V1::LevelsController < ApplicationController
  include LevelsHelper

  alias_method :get_app_options, :app_options

  # GET /api/v1/levels/:id/app_options
  def app_options
    @level = Level.find(params[:id])
    render json: get_app_options
  end
end

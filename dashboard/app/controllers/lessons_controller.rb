class LessonsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode, except: [:show]

  # GET /lessons/1
  def show
  end

  # GET /lessons/1/edit
  def edit
  end
end

class BackpacksController < ApplicationController
  before_action :authenticate_user!

  # GET /backpack/channel
  def get_channel
    backpack = Backpack.find_or_create(current_user.id, request.ip)
    render json: backpack.channel
  end
end

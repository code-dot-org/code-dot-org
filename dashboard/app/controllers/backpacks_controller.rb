class BackpacksController < ApplicationController
  before_action :authenticate_user!

  # GET /backpack/channel
  def get_channel
    backpack = Backpack.find_by_user_id(current_user.id)
    backpack ||= Backpack.create_for_user(current_user.id, request.ip)
    render json: backpack.channel
  end
end

class BackpacksController < ApplicationController
  before_action :authenticate_user!

  # GET /backpack/channel
  # Return the channel token for the backpack of the current user. If
  # the current user does not have a backpack, create one.
  def get_channel
    backpack = Backpack.find_or_create(current_user.id, request.ip)
    render json: backpack.channel
  end
end

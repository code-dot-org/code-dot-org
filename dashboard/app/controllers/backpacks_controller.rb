class BackpacksController < ApplicationController
  before_action :authenticate_user!

  # GET /backpacks/channel/:app_type
  # Return the channel token for the backpack of the current user with the given app_type. If
  # the current user does not have a backpack for the app_type, create one.
  def get_channel
    app_type = params[:app_type].capitalize
    game_id = Game.by_name(app_type)
    raise ActiveRecord::RecordNotFound, "Game not found for app_type name: #{app_type}" unless game_id

    backpack = Backpack.find_or_create(current_user.id, game_id, request.ip)
    render json: {channel: backpack.channel}
  end
end

class BackpacksController < ApplicationController
  before_action :authenticate_user!

  # GET /backpacks/channel(/:app_type)
  #
  # With an app_type, return the channel token for the current user's backpack for
  # that app, creating the backpack if the user does not have one yet.
  #
  # Without an app_type, return the channels of the backpacks the user already has,
  # keyed by app type. This form never creates a backpack.
  def get_channel
    return render(json: {channels: channels_by_app_type}) if params[:app_type].blank?

    app_type = params[:app_type].capitalize
    game_id = Game.by_name(app_type)
    raise ActiveRecord::RecordNotFound, "Game not found for app_type name: #{app_type}" unless game_id

    backpack = Backpack.find_or_create(current_user.id, game_id, request.ip)
    render json: {channel: backpack.channel}
  end

  private def channels_by_app_type
    backpacks = Backpack.where(user_id: current_user.id).includes(:game)
    backpacks.each_with_object({}) do |backpack, channels|
      # A backpack with no game cannot be addressed by app type, so it has no key here.
      app_type = backpack.game&.name&.downcase
      channels[app_type] = backpack.channel if app_type
    end
  end
end

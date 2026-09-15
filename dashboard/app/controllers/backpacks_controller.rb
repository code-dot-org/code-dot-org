class BackpacksController < ApplicationController
  before_action :authenticate_user!

  # GET /backpacks/channel(/:app_type)
  #
  # Return the channel token for the current user's backpack for the given app,
  # creating the backpack if the user does not have one yet. Without an app_type,
  # this is the user's backpack that belongs to no lab, their 'universal' backpack.
  def get_channel
    game_id = nil
    if params[:app_type].present?
      app_type = params[:app_type].capitalize
      game_id = Game.by_name(app_type)
      raise ActiveRecord::RecordNotFound, "Game not found for app_type name: #{app_type}" unless game_id
    end

    backpack = Backpack.find_or_create(current_user.id, game_id, request.ip)
    render json: {channel: backpack.channel}
  end

  # GET /backpacks/channels
  #
  # Return the channels of every backpack the current user already has, keyed by
  # app type. This creates nothing: a user with no backpacks gets an empty list.
  def get_channels
    backpacks = Backpack.where(user_id: current_user.id).order(:id).includes(:game)
    channels = backpacks.each_with_object({}) do |backpack, result|
      app_type = backpack.game_id ? backpack.game&.name&.downcase : SharedConstants::UNIVERSAL_APP_TYPE
      # A backpack whose game no longer exists cannot be keyed by app type.
      result[app_type] = backpack.channel if app_type
    end
    render json: {channels: channels}
  end
end

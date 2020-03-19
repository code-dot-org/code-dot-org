# Auth endpoint for prototype pusher features
require 'pusher'

class PusherController < ApplicationController
  def auth
    @pusher = Pusher::Client.new(
      app_id: CDO.pusher_app_id,
      key: CDO.pusher_application_key,
      secret: CDO.pusher_application_secret,
      use_tls: true
    )

    if current_user
      render json: @pusher.authenticate(
        params[:channel_name],
        params[:socket_id],
        {
          user_id: current_user.id
        }
      )
    else
      render text: 'Forbidden', status: '403'
    end
  end
end

class CollabChannel < ApplicationCable::Channel
  def subscribed
    stream_from "collab_channel_#{params[:collab_id]}"
    Rails.logger.info "Client #{params[:client_id]} subscribed to CollabChannel `#{params[:collab_id]}`"
  end

  def unsubscribed
    Rails.logger.info "User disconnected from CollabChannel `#{params[:collab_id]}`"
  end

  def push_updates(data)
    ActionCable.server.broadcast("collab_channel_#{params[:collab_id]}", data)
  end
end

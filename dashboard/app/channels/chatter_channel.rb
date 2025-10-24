class ChatterChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat-#{current_user.id}"
  end

  def speak(data)
    ActionCable.server.broadcast("chat-#{current_user.id}", data)
  end
end

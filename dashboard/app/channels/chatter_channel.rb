class ChatterChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat"
  end

  def speak(data)
    ActionCable.server.broadcast("chat", data)
  end
end
